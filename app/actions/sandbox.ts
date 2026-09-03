"use server";

import {
  getGenerationById,
  getLastCompletedGeneration,
  updateExerciseGeneration,
} from "@/app/actions/generations";
import { getGenerationPreviewSandbox } from "@/lib/ai/exercise-workspace";
import { assertCanEditExercise } from "@/lib/auth/can-edit-exercise";
import { requireAuth } from "@/lib/auth/require-auth";
import { getExerciseById } from "./exercises";

export async function initializeExercisePreview(
  exerciseId: number,
  generationId?: number | null
) {
  const [user, exercise, latestGeneration] = await Promise.all([
    requireAuth(),
    getExerciseById(exerciseId),
    getLastCompletedGeneration(exerciseId),
  ]);

  if (!exercise) {
    throw new Error(`Exercise ${exerciseId} not found`);
  }
  assertCanEditExercise(exercise, user);

  const selectedGeneration =
    generationId !== null && generationId !== undefined
      ? await getGenerationById(generationId)
      : latestGeneration;
  if (
    !selectedGeneration?.codeBlobKey ||
    selectedGeneration.exerciseId !== exercise.id
  ) {
    throw new Error("No se encontró una versión completa del ejercicio");
  }

  const sandbox = await getGenerationPreviewSandbox({
    checkpointBlobKey: selectedGeneration.codeBlobKey,
    exercise,
    generationId: selectedGeneration.id,
    sandboxName: selectedGeneration.sandboxId,
  });
  if (sandbox.name !== selectedGeneration.sandboxId) {
    await updateExerciseGeneration(selectedGeneration.id, {
      sandboxId: sandbox.name,
    });
  }

  return {
    sandboxName: sandbox.name,
    sandboxUrl: sandbox.domain(3000),
  };
}
