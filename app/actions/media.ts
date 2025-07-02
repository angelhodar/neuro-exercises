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
  const { prompt, tags, name, description, file } = data;

  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("No hay usuario autenticado");

    const mediaData = file
      ? await file.arrayBuffer()
      : await generateMediaFromPrompt(prompt!);

    const fileName = `media/${
      file ? file.name.replaceAll(" ", "-") : prompt!.replaceAll(" ", "-")
    }.png`;

    const blob = await uploadBlob(fileName, mediaData);

    await db.insert(medias).values({
      name: name,
      description: description || null,
      tags: tags,
      blobKey: blob.pathname,
      authorId: user.id,
    });

    revalidatePath("/dashboard/medias");

    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Error subiendo media:", error);
    throw new Error("No se pudo subir la imagen");
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
