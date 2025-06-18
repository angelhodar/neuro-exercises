"use server"

import { db } from "@/lib/db"
import { medias } from "@/lib/db/schema"
import { eq, desc, and, ne } from "drizzle-orm"
import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { togetherai } from "@ai-sdk/togetherai";
import { experimental_generateImage as generateImage } from "ai";
import { Buffer } from "buffer";
import { getCurrentUser } from "@/app/actions/users";

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

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file") as File
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const authorId = formData.get("authorId") as string

  if (!file || !name || !category || !authorId) {
    throw new Error("Missing required fields")
  }

  try {
    // Upload to Vercel Blob
    const blob = await put(`media/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    // Save to database
    await db.insert(medias).values({
      name,
      description: description || null,
      category,
      blobKey: blob.pathname,
      authorId,
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Upload error:", error)
    throw new Error("Failed to upload media")
  }
}

export async function deleteMedia(id: number, blobPathname: string) {
  try {
    // Delete from Vercel Blob
    await del(blobPathname)

    // Delete from database
    await db.delete(medias).where(eq(medias.id, id))

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Delete error:", error)
    throw new Error("Failed to delete media")
  }
}

export async function updateMedia(
  id: number,
  data: {
    name?: string
    description?: string
    category?: string
  },
) {
  try {
    await db
      .update(medias)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(medias.id, id))

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Update error:", error)
    throw new Error("Failed to update media")
  }
}

export async function generateMedia({ prompt, category }: { prompt: string, category: string }) {
  if (!prompt || !category) {
    throw new Error("Faltan campos obligatorios para generar la imagen");
  }

  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("No hay usuario autenticado");

    const { images } = await generateImage({
      model: togetherai.image('black-forest-labs/FLUX.1-schnell-Free'),
      prompt: `Generate an image of ${prompt.toLowerCase()}, clear and simple, centered, suitable for cognitive exercises, white background`,
      size: "512x512",
    });
    const [image] = images;
    if (!image) throw new Error("No se generó ninguna imagen");
    const imageBuffer = Buffer.from(image.uint8Array);
    const filename = `${category}/${prompt.replaceAll(" ", "-")}.png`;
    // Subir a Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: true
    });
    // Guardar en la base de datos
    await db.insert(medias).values({
      name: prompt,
      description: null,
      category,
      blobKey: blob.pathname,
      authorId: user.id,
    });
    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Error generando media:", error);
    throw new Error("No se pudo generar la imagen");
  }
}
