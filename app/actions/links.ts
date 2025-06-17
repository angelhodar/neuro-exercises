"use server"

import { nanoid } from "nanoid"
import { eq, desc, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseLinks, exerciseLinkItems, exercises, users } from "@/lib/db/schema"
import type { NewExerciseLink, NewExerciseLinkItem } from "@/lib/db/schema"
import { getCurrentUser } from "./users"

// Generar un token seguro usando nanoid
function generateSecureToken(): string {
  return nanoid(12)
}

// Crear un nuevo enlace compartible
export async function createExerciseLink(link: NewExerciseLink, items: Array<NewExerciseLinkItem>) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Usuario no autenticado")
    }

    // Generar token único
    const publicId = generateSecureToken()

    // Usar transacción para insertar el enlace y sus elementos
    const result = await db.transaction(async (tx) => {
      // Insertar el enlace principal
      const [newLink] = await tx
        .insert(exerciseLinks)
        .values({
          creatorId: currentUser.id,
          targetUserId: link.targetUserId,
          publicId: publicId,
          title: link.title,
          description: link.description || null
        })
        .returning()

      const itemsToInsert = items.map((item) => ({
        ...item,
        linkId: newLink.id
      }))

      const insertedItems = await tx.insert(exerciseLinkItems).values(itemsToInsert).returning()

      return { ...newLink, items: insertedItems }
    })

    return result
  } catch (error) {
    console.error("Error creating exercise link:", error)
    throw error
  }
}

// Obtener enlaces creados por un usuario
export async function getUserExerciseLinks() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Usuario no autenticado")
    }

    // Obtener enlaces con sus relaciones
    const links = await db
      .select({
        id: exerciseLinks.id,
        creatorId: exerciseLinks.creatorId,
        targetUserId: exerciseLinks.targetUserId,
        publicId: exerciseLinks.publicId,
        title: exerciseLinks.title,
        description: exerciseLinks.description,
        createdAt: exerciseLinks.createdAt,
        updatedAt: exerciseLinks.updatedAt,
        targetUser: {
          id: users.id,
          email: users.email,
          name: users.name,
        },
      })
      .from(exerciseLinks)
      .leftJoin(users, eq(exerciseLinks.targetUserId, users.id))
      .where(eq(exerciseLinks.creatorId, currentUser.id))
      .orderBy(desc(exerciseLinks.createdAt))

    // Obtener elementos para cada enlace
    const linksWithDetails = await Promise.all(
      links.map(async (link) => {
        const items = await db
          .select({
            id: exerciseLinkItems.id,
            exerciseId: exerciseLinkItems.exerciseId,
            config: exerciseLinkItems.config,
            position: exerciseLinkItems.position,
            exercise: {
              id: exercises.id,
              slug: exercises.slug,
              displayName: exercises.displayName,
              category: exercises.category,
            },
          })
          .from(exerciseLinkItems)
          .leftJoin(exercises, eq(exerciseLinkItems.exerciseId, exercises.id))
          .where(eq(exerciseLinkItems.linkId, link.id))

        return {
          ...link,
          items: items.map((item) => ({
            id: item.id,
            exerciseId: item.exerciseId,
            exercise: item.exercise
              ? {
                id: item.exercise.id,
                slug: item.exercise.slug,
                displayName: item.exercise.displayName,
                category: item.exercise.category,
              }
              : null,
            config: item.config,
            position: item.position,
          })),
        }
      }),
    )

    return linksWithDetails
  } catch (error) {
    console.error("Error getting user exercise links:", error)
    throw error
  }
}

// Eliminar un enlace
export async function deleteExerciseLink(linkId: number) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Usuario no autenticado")
    }

    // Verificar que el enlace pertenece al usuario
    const link = await db
      .select({ id: exerciseLinks.id })
      .from(exerciseLinks)
      .where(and(eq(exerciseLinks.id, linkId), eq(exerciseLinks.creatorId, currentUser.id)))
      .limit(1)

    if (!link.length) {
      throw new Error("Enlace no encontrado")
    }

    // Eliminar el enlace (las tablas relacionadas se eliminarán por CASCADE si está configurado)
    await db.delete(exerciseLinks).where(eq(exerciseLinks.id, linkId))

    return { success: true }
  } catch (error) {
    console.error("Error deleting exercise link:", error)
    throw error
  }
}

// Obtener un enlace por su public_id
export async function getExerciseLinkByPublicId(publicId: string) {
  try {
    // Obtener el enlace principal con información del usuario objetivo
    const linkData = await db
      .select({
        id: exerciseLinks.id,
        creatorId: exerciseLinks.creatorId,
        targetUserId: exerciseLinks.targetUserId,
        publicId: exerciseLinks.publicId,
        title: exerciseLinks.title,
        description: exerciseLinks.description,
        createdAt: exerciseLinks.createdAt,
        updatedAt: exerciseLinks.updatedAt,
        targetUser: {
          id: users.id,
          email: users.email,
          name: users.name,
        },
      })
      .from(exerciseLinks)
      .leftJoin(users, eq(exerciseLinks.targetUserId, users.id))
      .where(eq(exerciseLinks.publicId, publicId))
      .limit(1)

    if (!linkData.length) return null

    const link = linkData[0]

    // Obtener los elementos del enlace con información de los ejercicios
    const items = await db
      .select({
        id: exerciseLinkItems.id,
        exerciseId: exerciseLinkItems.exerciseId,
        config: exerciseLinkItems.config,
        position: exerciseLinkItems.position,
        exercise: {
          id: exercises.id,
          slug: exercises.slug,
          displayName: exercises.displayName,
          category: exercises.category,
          description: exercises.description,
          thumbnailUrl: exercises.thumbnailUrl,
        },
      })
      .from(exerciseLinkItems)
      .leftJoin(exercises, eq(exerciseLinkItems.exerciseId, exercises.id))
      .where(eq(exerciseLinkItems.linkId, link.id))
      .orderBy(exerciseLinkItems.position)

    return {
      ...link,
      items: items.map((item) => ({
        id: item.id,
        exerciseId: item.exerciseId,
        exercise: item.exercise
          ? {
            id: item.exercise.id,
            slug: item.exercise.slug,
            displayName: item.exercise.displayName,
            category: item.exercise.category,
            description: item.exercise.description,
            thumbnailUrl: item.exercise.thumbnailUrl,
          }
          : null,
        config: item.config,
        position: item.position,
      })),
    }
  } catch (error) {
    console.error("Error getting exercise link by public ID:", error)
    return null
  }
}
