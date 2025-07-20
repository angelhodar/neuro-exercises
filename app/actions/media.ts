"use server";

import { Buffer } from "buffer";
import { db } from "@/lib/db";
import { medias, type Media } from "@/lib/db/schema";
import { eq, desc, ilike, arrayOverlaps } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { togetherai } from "@ai-sdk/togetherai";
import { experimental_generateImage as generateImage } from "ai";
import { getCurrentUser } from "@/app/actions/users";
import type { CreateMediaSchema } from "@/lib/schemas/medias";
import { uploadBlob, deleteBlobs } from "@/lib/storage";

const MODEL = "black-forest-labs/FLUX.1-schnell-Free";

export async function getMedias(
  searchTerm?: string,
  tags?: string[],
  limit?: number,
) {
  const result = await db.query.medias.findMany({
    where: (fields) => {
      const conditions = [];

      if (searchTerm && searchTerm.trim()) {
        conditions.push(ilike(fields.name, `%${searchTerm.trim()}%`));
      }

      if (tags && tags.length > 0) {
        conditions.push(arrayOverlaps(fields.tags, tags));
      }

      if (conditions.length === 0) return undefined;
      else if (conditions.length === 1) return conditions[0];
      else {
        return conditions.reduce((acc, condition) => {
          return acc ? acc && condition : condition;
        });
      }
    },
    with: {
      author: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: desc(medias.createdAt),
    limit,
  });

  return result;
}

export async function getMediasByTags(tags: string[]): Promise<Media[]> {
  if (!tags || tags.length === 0) {
    return [];
  }

  const result = await db.query.medias.findMany({
    where: arrayOverlaps(medias.tags, tags),
  });

  return result;
}

export async function generateMediaFromPrompt(prompt: string) {
  const { images } = await generateImage({
    model: togetherai.image(MODEL),
    prompt: `Generate an image of ${prompt.toLowerCase()}, clear and simple, centered, suitable for cognitive exercises, white background`,
    size: "512x512",
  });

  const [image] = images;
  if (!image) throw new Error("No se generó ninguna imagen");

  return Buffer.from(image.uint8Array);
}

export async function uploadMedia(data: CreateMediaSchema) {
  const { prompt, tags, name, description, file, mediaType } = data;

  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("No hay usuario autenticado");

    let mediaData: ArrayBuffer;
    let mimeType: string;
    let fileName: string;
    let metadata: Record<string, any> = {};

    if (file) {
      mediaData = await file.arrayBuffer();
      mimeType = file.type;
      
      // Determine file extension based on mime type
      const extension = mimeType.split('/')[1] || 'bin';
      fileName = `media/${file.name.replaceAll(" ", "-")}.${extension}`;
      
      // Add file metadata
      metadata = {
        originalName: file.name,
        size: file.size,
        lastModified: file.lastModified,
      };
    } else {
      // Generate image from prompt
      const imageBuffer = await generateMediaFromPrompt(prompt!);
      mediaData = imageBuffer.buffer.slice(imageBuffer.byteOffset, imageBuffer.byteOffset + imageBuffer.byteLength);
      mimeType = 'image/png';
      fileName = `media/${prompt!.replaceAll(" ", "-")}.png`;
      metadata = {
        generatedFromPrompt: prompt,
        model: MODEL,
      };
    }

    const blob = await uploadBlob(fileName, mediaData);

    // Generate thumbnail for video files
    let thumbnailKey: string | null = null;
    if (mimeType.startsWith('video/') && file) {
      try {
        // For now, we'll use the first frame as thumbnail
        // In a production environment, you might want to use FFmpeg or similar
        thumbnailKey = blob.pathname; // Use the same file as thumbnail for now
        metadata.thumbnailGenerated = true;
      } catch (error) {
        console.warn("Could not generate thumbnail for video:", error);
      }
    }

    await db.insert(medias).values({
      name: name,
      description: description || null,
      tags: tags,
      blobKey: blob.pathname,
      mimeType: mimeType,
      thumbnailKey: thumbnailKey,
      metadata: metadata,
      authorId: user.id,
    });

    revalidatePath("/dashboard/medias");

    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Error subiendo media:", error);
    throw new Error("No se pudo subir el archivo");
  }
}

export async function deleteMedia(id: number, blobPathname: string) {
  try {
    await Promise.all([
      deleteBlobs(blobPathname),
      db.delete(medias).where(eq(medias.id, id)),
    ]);
    revalidatePath("/dashboard/medias");
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete media");
  }
}
