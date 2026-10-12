"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  generateAudioInstructions,
  generateExerciseData,
  generateThumbnail,
} from "@/lib/ai/exercise-metadata";
import { findRequirementDraft } from "@/lib/ai/refinement/draft-repository";
import { formatExerciseBrief } from "@/lib/ai/refinement/format-brief";
import { getRefinementState } from "@/lib/ai/refinement/state";
import { assertCanEditExercise } from "@/lib/auth/can-edit-exercise";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import type { Exercise } from "@/lib/db/schema";
import { exerciseRequirementDrafts, exercises } from "@/lib/db/schema";
import {
  type CreateExerciseSchema,
  createExerciseSchema,
  type RegisterExerciseSchema,
  registerExerciseSchema,
  type UpdateExerciseSchema,
  updateExerciseSchema,
} from "@/lib/schemas/exercises";
import { uploadBlobPathname } from "@/lib/storage";
import { createExerciseGeneration } from "./generations";

// Función para subir thumbnail manualmente
async function uploadThumbnail(
  file: File,
  slug: string
): Promise<string | null> {
  try {
    const fileName = `thumbnails/${slug}.${file.name.split(".").pop()}`;
    return await uploadBlobPathname(fileName, file);
  } catch (error) {
    console.error("Error subiendo thumbnail:", error);
    return null;
  }
}

export async function getExercises(slugs?: string[], query?: string) {
  if (slugs && slugs.length > 0) {
    const filteredExercises = await db.query.exercises.findMany({
      where: (exerciseTable, { inArray }) => inArray(exerciseTable.slug, slugs),
    });

    return filteredExercises;
  }

  const allExercises = await db.query.exercises.findMany({
    where: query
      ? (exerciseTable, { ilike }) =>
          ilike(exerciseTable.displayName, `%${query}%`)
      : undefined,
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
    const user = await requireAuth();
    let { brief } = parsed;
    if (parsed.draftId) {
      const draft = await findRequirementDraft(parsed.draftId, user.id);
      if (!draft || draft.revision !== parsed.draftRevision) {
        throw new Error(
          "El borrador cambió. Recarga antes de crear el ejercicio."
        );
      }
      if (draft.createdExerciseId) {
        return getExerciseById(draft.createdExerciseId);
      }
      const { pendingBrief, canUseBrief } = getRefinementState({
        creating: false,
        hasError: false,
        messages: draft.messages,
        status: "ready",
      });
      if (!(canUseBrief && pendingBrief)) {
        throw new Error("El borrador no está listo para crear el ejercicio.");
      }
      ({ brief } = pendingBrief.input);
    }
    const prompt = formatExerciseBrief(brief);

    const generatedData = await generateExerciseData(prompt);

    const [thumbnail, audioInstructions] = await Promise.all([
      generateThumbnail(generatedData.thumbnailPrompt, generatedData.slug),
      generateAudioInstructions(generatedData.audioPrompt, generatedData.slug),
    ]);

    const [created] = await db
      .insert(exercises)
      .values({
        ...generatedData,
        audioInstructions,
        creatorId: user.id,
        thumbnailUrl: thumbnail,
      })
      .returning();

    // The first Harness turn starts from the specification approved by the user.
    if (created) {
      await createExerciseGeneration({
        exerciseId: created.id,
        prompt,
      });
      if (parsed.draftId) {
        await db
          .update(exerciseRequirementDrafts)
          .set({ createdExerciseId: created.id })
          .where(
            and(
              eq(exerciseRequirementDrafts.id, parsed.draftId),
              eq(exerciseRequirementDrafts.creatorId, user.id)
            )
          );
      }
    }

    revalidatePath("/dashboard");
    return created || null;
  } catch (error) {
    console.error("Error al crear el ejercicio:", error);
    return null;
  }
}

export async function getUnregisteredExerciseSlugs(): Promise<string[]> {
  try {
    const { getImplementedExerciseSlugs } = await import(
      "@/app/exercises/scanner"
    );
    const [implementedSlugs, dbExercises] = await Promise.all([
      getImplementedExerciseSlugs(),
      db.query.exercises.findMany({ columns: { slug: true } }),
    ]);
    const registeredSlugs = new Set(dbExercises.map((e) => e.slug));
    return implementedSlugs.filter((slug) => !registeredSlugs.has(slug));
  } catch (error) {
    console.error("Error getting unregistered exercise slugs:", error);
    return [];
  }
}

export async function registerExercise(
  data: RegisterExerciseSchema
): Promise<Exercise | null> {
  try {
    const parsed = registerExerciseSchema.parse(data);
    const user = await requireAuth();
    const { slug, displayName, description, tags, thumbnailPrompt, file } =
      parsed;

    let thumbnailUrl: string | null = null;

    if (file) {
      thumbnailUrl = await uploadThumbnail(file, slug);
    } else if (thumbnailPrompt) {
      thumbnailUrl = await generateThumbnail(thumbnailPrompt, slug);
    }

    const [created] = await db
      .insert(exercises)
      .values({
        creatorId: user.id,
        description: description || null,
        displayName,
        slug,
        tags,
        thumbnailUrl,
      })
      .returning();

    revalidatePath("/dashboard");
    return created || null;
  } catch (error) {
    console.error("Error al registrar el ejercicio:", error);
    return null;
  }
}

export async function updateExercise(
  data: UpdateExerciseSchema
): Promise<Exercise | null> {
  try {
    const parsed = updateExerciseSchema.parse(data);
    const {
      id,
      displayName,
      description,
      tags,
      thumbnailPrompt,
      file,
      audioPrompt,
    } = parsed;

    let thumbnailUrl: string | null = null;
    let audioInstructions: string | null = null;

    // Obtener el ejercicio actual para usar su slug
    const exercise = await getExerciseById(id);
    if (!exercise) {
      throw new Error("Ejercicio no encontrado");
    }
    const user = await requireAuth();
    assertCanEditExercise(exercise, user);

    // Si se proporciona un archivo, subirlo
    if (file) {
      thumbnailUrl = await uploadThumbnail(file, exercise.slug);
    }
    // Si no hay archivo pero hay un thumbnailPrompt, generar nueva miniatura
    else if (thumbnailPrompt) {
      thumbnailUrl = await generateThumbnail(thumbnailPrompt, exercise.slug);
    }

    // Si se proporciona audioPrompt, generar nuevo audio
    if (audioPrompt) {
      audioInstructions = await generateAudioInstructions(
        audioPrompt,
        exercise.slug
      );
    }

    const updateData: Partial<Exercise> = {
      description,
      displayName,
      tags,
      updatedAt: new Date(),
    };

    // Solo actualizar thumbnailUrl si se generó o subió una nueva
    if (thumbnailUrl) {
      updateData.thumbnailUrl = thumbnailUrl;
    }

    // Solo actualizar audioInstructions si se generó un nuevo audio
    if (audioInstructions) {
      updateData.audioInstructions = audioInstructions;
    }

    const [updated] = await db
      .update(exercises)
      .set(updateData)
      .where(eq(exercises.id, id))
      .returning();

    revalidatePath("/dashboard");
    return updated || null;
  } catch (error) {
    console.error("Error al actualizar el ejercicio:", error);
    return null;
  }
}
