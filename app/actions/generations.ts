"use server";

import { db } from "@/lib/db";
import { exerciseChatGeneration, exercises } from "@/lib/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import type { ExerciseChatGeneration } from "@/lib/db/schema";
import { getCurrentUser } from "./users";

export async function getExerciseGenerations(
  exerciseId: number,
): Promise<ExerciseChatGeneration[]> {
  try {
    const generations = await db.query.exerciseChatGeneration.findMany({
      where: eq(exerciseChatGeneration.exerciseId, exerciseId),
      orderBy: asc(exerciseChatGeneration.createdAt),
    });

    return generations;
  } catch (error) {
    console.error("Error getting exercise generations:", error);
    return [];
  }
}

export async function createExerciseGeneration(data: {
  exerciseId: number;
  prompt: string;
}): Promise<ExerciseChatGeneration | null> {
  try {
    const user = await getCurrentUser();

    if (!user) return null;

    const [generation] = await db
      .insert(exerciseChatGeneration)
      .values({
        exerciseId: data.exerciseId,
        userId: user.id,
        status: "GENERATING",
        prompt: data.prompt,
      })
      .returning();

    return generation;
  } catch (error) {
    console.error("Error creating exercise generation:", error);
    return null;
  }
}

export async function updateExerciseGeneration(
  id: number,
  updates: {
    status?: "GENERATING" | "COMPLETED" | "ERROR";
    summary?: string;
    codeBlobKey?: string;
    sandboxId?: string;
  },
): Promise<ExerciseChatGeneration | null> {
  try {
    const [generation] = await db
      .update(exerciseChatGeneration)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(exerciseChatGeneration.id, id))
      .returning();

    return generation;
  } catch (error) {
    console.error("Error updating exercise generation:", error);
    return null;
  }
}

export async function getLastCompletedGeneration(
  slug: string,
): Promise<ExerciseChatGeneration | null> {
  try {
    const generation = await db.query.exerciseChatGeneration.findFirst({
      where: (generation, { eq }) => eq(generation.status, "COMPLETED"),
      with: {
        exercise: true,
      },
      orderBy: (generation, { desc }) => desc(generation.createdAt),
    });

    // Filter by slug since we can't directly query by exercise slug
    if (generation && generation.exercise.slug === slug) {
      return generation;
    }

    // If no generation found or slug doesn't match, try alternative approach
    const generationWithJoin = await db
      .select()
      .from(exerciseChatGeneration)
      .innerJoin(exercises, eq(exerciseChatGeneration.exerciseId, exercises.id))
      .where(
        and(
          eq(exerciseChatGeneration.status, "COMPLETED"),
          eq(exercises.slug, slug),
        ),
      )
      .orderBy(desc(exerciseChatGeneration.createdAt))
      .limit(1);

    if (generationWithJoin.length > 0) {
      return generationWithJoin[0].exercise_chat_generation;
    }

    return null;
  } catch (error) {
    console.error("Error getting last completed generation:", error);
    return null;
  }
}
