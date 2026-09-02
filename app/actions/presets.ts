"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  exerciseConfigPresets,
  type NewExerciseConfigPreset,
} from "@/lib/db/schema";
import { getCurrentUser } from "./users";

export async function getExercisePresets(exerciseId: number) {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  return db.query.exerciseConfigPresets.findMany({
    orderBy: (preset) => preset.name,
    where: and(
      eq(exerciseConfigPresets.exerciseId, exerciseId),
      eq(exerciseConfigPresets.creatorId, user.id)
    ),
  });
}

export async function createExercisePreset(data: {
  exerciseId: number;
  name: string;
  config: NewExerciseConfigPreset["config"];
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const [preset] = await db
    .insert(exerciseConfigPresets)
    .values({
      config: data.config,
      creatorId: user.id,
      exerciseId: data.exerciseId,
      name: data.name,
    })
    .returning();

  revalidatePath("/dashboard");
  return preset;
}

export async function deleteExercisePreset(presetId: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  await db
    .delete(exerciseConfigPresets)
    .where(
      and(
        eq(exerciseConfigPresets.id, presetId),
        eq(exerciseConfigPresets.creatorId, user.id)
      )
    );

  revalidatePath("/dashboard");
}
