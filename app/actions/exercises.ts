"use server"

import { db } from "@/lib/db"
import { exercises } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { Exercise } from "@/lib/db/schema"

export async function getAvailableExercises(): Promise<Exercise[]> {
  try {
    const allExercises = await db.query.exercises.findMany({
      orderBy: [exercises.category, exercises.displayName],
    })

    return allExercises
  } catch (error) {
    console.error("Error getting available exercises:", error)
    throw error
  }
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  try {
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, id),
    })

    return exercise || null
  } catch (error) {
    console.error("Error getting exercise by ID:", error)
    return null
  }
}

export async function getExerciseBySlug(slug: string): Promise<Exercise | null> {
  try {
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.slug, slug),
    })

    return exercise || null
  } catch (error) {
    console.error("Error getting exercise by slug:", error)
    return null
  }
}