"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Exercise } from "@/lib/db/schema";
import {
  createExerciseSchema,
  CreateExerciseSchema,
} from "@/lib/schemas/exercises"
import { createExercisePR } from "./github";

export async function getExercises() {
  const allExercises = await db.query.exercises.findMany({
    orderBy: [exercises.displayName],
  });

  return allExercises;
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  try {
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, id),
    });

    return exercise || null;
  } catch (error) {
    console.error("Error getting exercise by ID:", error);
    return null;
  }
}

export async function getExerciseBySlug(
  slug: string
): Promise<Exercise | null> {
  try {
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.slug, slug),
    });

    return exercise || null;
  } catch (error) {
    console.error("Error getting exercise by slug:", error);
    return null;
  }
}

export async function createExercise(
  data: CreateExerciseSchema
): Promise<Exercise | null> {
  try {
    const parsed = createExerciseSchema.parse(data);

    const { thumbnail, prompt, ...rest } = parsed;

    let thumbnailPath: string | undefined = undefined;

    if (thumbnail instanceof File) {
      const upload = await put(`thumbnails/${thumbnail.name}`, thumbnail, {
        access: "public",
        addRandomSuffix: true,
      });
      thumbnailPath = upload.pathname;
    }

    const [created] = await db
      .insert(exercises)
      .values({
        ...rest,
        thumbnailUrl: thumbnailPath,
      })
      .returning();

    if (created && prompt) await createExercisePR(created, prompt);

    revalidatePath("/dashboard");
    return created || null;
  } catch (error) {
    console.error("Error al crear el ejercicio:", error);
    return null;
  }
}
