"use server";

import { Buffer } from "node:buffer";
import { generateImage, generateText, Output } from "ai";
import {
  arrayOverlaps,
  cosineDistance,
  desc,
  eq,
  getTableColumns,
  gt,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateEmbedding, generateQueryEmbedding } from "@/lib/ai/embedding";
import { translatePromptToEnglish } from "@/lib/ai/translate";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { type Media, medias } from "@/lib/db/schema";
import { optimizeImage } from "@/lib/media/optimize";
import {
  type DownloadableImage,
  searchImages as searchImagesFromSerper,
} from "@/lib/media/serper";
import type { CreateManualMediaSchema } from "@/lib/schemas/medias";
import { mediaMetadataSchema } from "@/lib/schemas/medias";
import { deleteBlobs, uploadBlob } from "@/lib/storage";
import { createBlobUrl, downloadFromUrl } from "@/lib/utils";

const IMAGE_MODEL = "bfl/flux-2-flex";

async function generateImageMetadata(imageUrl: string) {
  const { output } = await generateText({
    model: "google/gemini-2.5-flash",
    output: Output.object({ schema: mediaMetadataSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analiza esta imagen utilizando palabras en castellano. Genera metadatos apropiados para la imagen: un nombre corto y descriptivo, una descripción de una frase y una lista de etiquetas (máximo 5) que la clasifiquen",
          },
          {
            type: "image",
            image: new URL(imageUrl),
          },
        ],
      },
    ],
  });

  if (!output) {
    throw new Error("Failed to generate image metadata");
  }

  return output;
}

async function generateAndInsertMedia(
  prompt: string,
  authorId: string,
  options?: { sourceImage?: Buffer; derivedFrom?: number }
) {
  const translatedPrompt = await translatePromptToEnglish(prompt);

  const imagePrompt = options?.sourceImage
    ? { text: translatedPrompt, images: [options.sourceImage] }
    : `Generate an image of ${translatedPrompt.toLowerCase()}, clear and simple, centered, white background`;

  const { images } = await generateImage({
    model: IMAGE_MODEL,
    prompt: imagePrompt,
    size: "512x512",
  });

  const [image] = images;
  if (!image) {
    throw new Error("Error generating image");
  }

  const optimized = await optimizeImage(Buffer.from(image.uint8Array));
  const blob = await uploadBlob(
    `library/${crypto.randomUUID()}.webp`,
    optimized
  );

  const metadata = await generateImageMetadata(blob.url);
  const embedding = metadata.description
    ? await generateEmbedding(metadata.description)
    : undefined;

  await db.insert(medias).values({
    name:
      metadata.name.charAt(0).toUpperCase() +
      metadata.name.slice(1).toLowerCase(),
    description: metadata.description,
    tags: metadata.tags.map((tag) => tag.toLowerCase()),
    blobKey: blob.pathname,
    mimeType: "image/webp",
    thumbnailKey: null,
    metadata: { prompt, model: IMAGE_MODEL },
    authorId,
    derivedFrom: options?.derivedFrom ?? null,
    embedding,
  });
}

export async function getMedias(searchTerm?: string, limit = 20) {
  const columns = getTableColumns(medias);
  const trimmed = searchTerm?.trim();

  const queryEmbedding = trimmed ? await generateQueryEmbedding(trimmed) : null;

  const similarity = queryEmbedding
    ? sql<number>`1 - (${cosineDistance(medias.embedding, queryEmbedding)})`
    : null;

  return db
    .select({ ...columns, ...(similarity ? { similarity } : {}) })
    .from(medias)
    .where(similarity ? gt(similarity, 0.3) : undefined)
    .orderBy(similarity ? desc(similarity) : desc(medias.createdAt))
    .limit(limit);
}

export async function getMediasByTags(tags: string[]): Promise<Media[]> {
  if (!tags || tags.length === 0) {
    return [];
  }

  return await db.query.medias.findMany({
    where: arrayOverlaps(medias.tags, tags),
  });
}

export async function generateDerivedMedia(media: Media, prompt: string) {
  const user = await requireAuth();

  const sourceImage = await fetch(createBlobUrl(media.blobKey))
    .then((r) => r.arrayBuffer())
    .then((b) => Buffer.from(b));

  await generateAndInsertMedia(prompt, user.id, {
    sourceImage,
    derivedFrom: media.id,
  });

  revalidatePath("/dashboard/media");
}

export async function generateMediaFromPrompt(prompt: string) {
  const user = await requireAuth();
  await generateAndInsertMedia(prompt, user.id);
  revalidatePath("/dashboard/media");
}

export async function uploadManualMedia(data: CreateManualMediaSchema) {
  const user = await requireAuth();
  const { fileKey, ...rest } = data;

  const embedding = rest.description
    ? await generateEmbedding(rest.description)
    : undefined;

  await db.insert(medias).values({
    ...rest,
    tags: rest.tags.map((tag) => tag.toLowerCase()),
    blobKey: fileKey,
    authorId: user.id,
    embedding,
  });

  revalidatePath("/dashboard/medias");
}

export async function deleteMedia(media: Media) {
  const blobKeys = [media.blobKey, media.thumbnailKey].filter(
    Boolean
  ) as string[];

  await db.delete(medias).where(eq(medias.id, media.id));
  await deleteBlobs(blobKeys);

  revalidatePath("/dashboard/medias");
}

export async function searchImages(query: string, numResults?: number) {
  return await searchImagesFromSerper(query, numResults);
}

export async function transferImagesToLibrary(images: DownloadableImage[]) {
  const user = await requireAuth();

  const results = await Promise.all(
    images.map(async (image) => {
      try {
        const [metadata, imageBuffer] = await Promise.all([
          generateImageMetadata(image.imageUrl),
          downloadFromUrl(image.imageUrl).then((arrayBuffer) =>
            optimizeImage(Buffer.from(arrayBuffer))
          ),
        ]);

        const fileName = `library/${crypto.randomUUID()}.webp`;
        const blob = await uploadBlob(fileName, imageBuffer);

        const embedding = metadata.description
          ? await generateEmbedding(metadata.description)
          : undefined;

        await db.insert(medias).values({
          name:
            metadata.name.charAt(0).toUpperCase() +
            metadata.name.slice(1).toLowerCase(),
          description: metadata.description,
          tags: metadata.tags.map((tag) => tag.toLowerCase()),
          blobKey: blob.pathname,
          authorId: user.id,
          mimeType: "image/webp",
          metadata: { originalImageUrl: image.imageUrl },
          embedding,
        });

        return { success: true, name: metadata.name, url: blob.url };
      } catch (error) {
        console.error(`Error processing image ${image.title}:`, error);
        return {
          success: false,
          name: image.title,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  revalidatePath("/dashboard/media");
  return results;
}
