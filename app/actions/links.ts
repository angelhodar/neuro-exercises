"use server"

import { nanoid } from "nanoid"
import { eq, desc, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseLinks, exerciseLinkItems, exerciseResults } from "@/lib/db/schema"
import type { NewExerciseLink, NewExerciseLinkItem } from "@/lib/db/schema"
import { getCurrentUser } from "./users"

function generateSecureToken(): string {
  return nanoid(12)
}

export async function createExerciseLink(link: NewExerciseLink, items: Array<NewExerciseLinkItem>) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Usuario no autenticado")
    }

    const [newLink] = await db
      .insert(exerciseLinks)
      .values({
        creatorId: currentUser.id,
        targetUserId: link.targetUserId,
        publicId: generateSecureToken(),
        title: link.title,
        description: link.description || null,
      })
      .returning()

    const itemsToInsert = items.map((item) => ({
      ...item,
      linkId: newLink.id,
    }))

    const insertedItems = await db.insert(exerciseLinkItems).values(itemsToInsert).returning()

    return { ...newLink, items: insertedItems }
  } catch (error) {
    console.error("Error creating exercise link:", error)
    throw error
  }
}

export async function getUserExerciseLinks() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Usuario no autenticado")
    }

    const linksWithDetails = await db.query.exerciseLinks.findMany({
      where: eq(exerciseLinks.creatorId, currentUser.id),
      orderBy: desc(exerciseLinks.createdAt),
      with: {
        targetUser: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
        exerciseLinkItems: {
          with: {
            exercise: {
              columns: {
                id: true,
                slug: true,
                displayName: true,
                tags: true,
              },
            },
          },
        },
      },
    })

    return linksWithDetails
  } catch (error) {
    console.error("Error getting user exercise links:", error)
    throw error
  }
}


export async function deleteExerciseLink(linkId: number) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Usuario no autenticado")
    }

    const link = await db
      .select({ id: exerciseLinks.id })
      .from(exerciseLinks)
      .where(and(eq(exerciseLinks.id, linkId), eq(exerciseLinks.creatorId, currentUser.id)))
      .limit(1)

    if (!link.length) {
      throw new Error("Enlace no encontrado")
    }

    await db.delete(exerciseLinks).where(eq(exerciseLinks.id, linkId))

    return { success: true }
  } catch (error) {
    console.error("Error deleting exercise link:", error)
    throw error
  }
}

export async function getExerciseLinkByPublicId(publicId: string) {
  try {
    const linkWithDetails = await db.query.exerciseLinks.findFirst({
      where: eq(exerciseLinks.publicId, publicId),
      with: {
        targetUser: true,
        creator: true,
        exerciseLinkItems: {
          orderBy: exerciseLinkItems.position,
          with: {
            exercise: true,
            exerciseResults: true
          },
        },
      },
    })

    return linkWithDetails || null
  } catch (error) {
    console.error("Error getting exercise link by public ID:", error)
    return null
  }
}

export async function saveExerciseResults(exerciseItemId: number, results: any) {
  try {
    await db.insert(exerciseResults).values({
      linkItemId: exerciseItemId,
      results,
    });
    return { ok: true };
  } catch (error) {
    console.error("Error guardando resultados del ejercicio:", error);
    throw error;
  }
}