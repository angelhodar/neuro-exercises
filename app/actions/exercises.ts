"use server";

import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Exercise } from "@/lib/db/schema";
import {
  createExerciseSchema,
  CreateExerciseSchema,
  updateExerciseSchema,
  UpdateExerciseSchema,
  generatedExerciseSchema,
} from "@/lib/schemas/exercises";
import { createExercisePR } from "./github";
import { generateAudio } from "@/lib/ai/audio";
import { generateMediaFromPrompt } from "./media";
import { uploadBlobPathname } from "@/lib/storage";

// Función para generar thumbnail
async function generateThumbnail(thumbnailPrompt: string, slug: string): Promise<string | null> {
  try {
    const imageBuffer = await generateMediaFromPrompt(thumbnailPrompt);
    const fileName = `thumbnails/${slug}.png`;
    return await uploadBlobPathname(fileName, imageBuffer);
  } catch (error) {
    console.error("Error generando thumbnail:", error);
    return null;
  }
}

// Función para subir thumbnail manualmente
async function uploadThumbnail(file: File, slug: string): Promise<string | null> {
  try {
    const fileName = `thumbnails/${slug}.${file.name.split('.').pop()}`;
    return await uploadBlobPathname(fileName, file);
  } catch (error) {
    console.error("Error subiendo thumbnail:", error);
    return null;
  }
}

async function generateAudioInstructions(audioPrompt: string, slug: string): Promise<string | null> {
  try {
    const audioBuffer = await generateAudio(audioPrompt);
    const fileName = `audio/${slug}.mp3`;
    return await uploadBlobPathname(fileName, audioBuffer);
  } catch (error) {
    console.error("Error generando audio:", error);
    return null;
  }
}

export async function getExercises() {
  const allExercises = await db.query.exercises.findMany();

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

async function generateExerciseData(prompt: string) {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: generatedExerciseSchema,
    system: "Eres un especialista en neuropsicología y diseño de ejercicios cognitivos. Tu tarea es generar metadatos completos para un ejercicio neurocognitivo basándote en la descripción del usuario. Cada campo del objeto que generes debe seguir exactamente las especificaciones descritas",
    prompt,
  });

  return object;
}

export async function createExercise(
  data: CreateExerciseSchema
): Promise<Exercise | null> {
  try {
    const parsed = createExerciseSchema.parse(data);
    const { prompt } = parsed;

    const generatedData = await generateExerciseData(prompt);

    const [thumbnail, audioInstructions] = await Promise.all([
      generateThumbnail(generatedData.thumbnailPrompt, generatedData.slug),
      generateAudioInstructions(generatedData.audioPrompt, generatedData.slug)
    ]);

    const [created] = await db
      .insert(exercises)
      .values({
        ...generatedData,
        thumbnailUrl: thumbnail,
        audioInstructions,
      })
      .returning();

    if (created) await createExercisePR(created, prompt);

    revalidatePath("/dashboard");
    return created || null;
  } catch (error) {
    console.error("Error al crear el ejercicio:", error);
    return null;
  }
}

export async function updateExercise(
  data: UpdateExerciseSchema
): Promise<Exercise | null> {
  try {
    const parsed = updateExerciseSchema.parse(data);
    const { id, displayName, description, tags, thumbnailPrompt, file, audioPrompt } = parsed;

    let thumbnailUrl: string | null = null;
    let audioInstructions: string | null = null;

    // Obtener el ejercicio actual para usar su slug
    const exercise = await getExerciseById(id);
    if (!exercise) {
      throw new Error("Ejercicio no encontrado");
    }

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
      audioInstructions = await generateAudioInstructions(audioPrompt, exercise.slug);
    }

    const updateData: Partial<Exercise> = {
      displayName,
      description,
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
