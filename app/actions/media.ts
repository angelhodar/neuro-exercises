"use server";

import { Buffer } from "buffer";
import { db } from "@/lib/db";
import { medias } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { togetherai } from "@ai-sdk/togetherai";
import { experimental_generateImage as generateImage } from "ai";
import { getCurrentUser } from "@/app/actions/users";
import type { CreateMediaSchema } from "@/lib/schemas/medias";

const MODEL = "black-forest-labs/FLUX.1-schnell-Free";

export async function getMedias(category?: string) {
  const result = await db.query.medias.findMany({
    where: (fields, { eq, and, ne }) => {
      const conditions = [ne(fields.category, "thumbnails")];
      if (category) conditions.push(eq(fields.category, category));
      return and(...conditions);
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
  });

  return result;
}

async function generateMediaFromPrompt(prompt: string) {
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
  const { prompt, category, name, description, file } = data;

  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("No hay usuario autenticado");

    const data = file
      ? await file.arrayBuffer()
      : await generateMediaFromPrompt(prompt!);
    const fileName = `${category}/${
      file ? file.name.replaceAll(" ", "-") : prompt!.replaceAll(" ", "-")
    }.png`;

    const blob = await put(fileName, data, {
      access: "public",
      addRandomSuffix: true,
    });

    await db.insert(medias).values({
      name: name,
      description: description || null,
      category,
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
      del(blobPathname),
      db.delete(medias).where(eq(medias.id, id)),
    ]);
    revalidatePath("/dashboard/medias");
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete media");
  }
}
