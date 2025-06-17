"use server"

import { db } from "@/lib/db"
import { medias } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function getMedias() {
  const result = await db.query.medias.findMany({
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
