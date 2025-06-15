"use server"

import { db } from "@/lib/db"
import { exercises } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { Exercise } from "@/lib/db/schema"

// Obtener todos los ejercicios disponibles
export async function getAvailableExercises(): Promise<Exercise[]> {
  try {
    const exerciseData = await db.select().from(exercises).orderBy(exercises.category, exercises.displayName)

    return exerciseData
  } catch (error) {
    console.error("Error getting available exercises:", error)
    throw error
  }
}

// Obtener un ejercicio por su ID
export async function getExerciseById(id: number): Promise<Exercise | null> {
  try {
    const exerciseData = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1)

    if (!exerciseData.length) return null

    return exerciseData[0]
  } catch (error) {
    console.error("Error getting exercise by ID:", error)
    return null
  }
}

// Obtener un ejercicio por su slug
export async function getExerciseBySlug(slug: string): Promise<Exercise | null> {
  try {
    const exerciseData = await db.select().from(exercises).where(eq(exercises.slug, slug)).limit(1)

    if (!exerciseData.length) return null

    return exerciseData[0]
  } catch (error) {
    console.error("Error getting exercise by slug:", error)
    return null
  }
}
