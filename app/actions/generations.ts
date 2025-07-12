"use server";

import { db } from "@/lib/db";
import { exerciseChatGeneration } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
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
        status: "PENDING",
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
    status?: "PENDING" | "GENERATING" | "COMPLETED" | "ERROR";
    summary?: string;
    codeBlobKey?: string;
    sandboxId?: string | null;
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
  exerciseId: number,
): Promise<ExerciseChatGeneration | null> {
  try {
    const generation = await db.query.exerciseChatGeneration.findFirst({
      where: (generation, { eq, and }) => 
        and(
          eq(generation.status, "COMPLETED"),
          eq(generation.exerciseId, exerciseId)
        ),
      orderBy: (generation, { desc }) => desc(generation.createdAt),
    });

    return generation || null;
  } catch (error) {
    console.error("Error getting last completed generation:", error);
    return null;
  }
}
