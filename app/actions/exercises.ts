"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Exercise } from "@/lib/db/schema";
import {
  createExerciseSchema,
  CreateExerciseSchema,
  generatedExerciseSchema,
} from "@/lib/schemas/exercises";
import { createExercisePR } from "./github";
import { generateMediaFromPrompt } from "./media";

// Función para generar thumbnail
async function generateThumbnail(thumbnailPrompt: string, slug: string): Promise<string | undefined> {
  try {
    const imageBuffer = await generateMediaFromPrompt(thumbnailPrompt);
    
    const fileName = `thumbnails/${slug}.png`;
    const blob = await put(fileName, imageBuffer, {
      access: "public",
      addRandomSuffix: true,
    });
    
    return blob.pathname;
  } catch (error) {
    console.error("Error generando thumbnail:", error);
    return undefined;
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

export async function createExercise(
  data: CreateExerciseSchema
): Promise<Exercise | null> {
  try {
    const parsed = createExerciseSchema.parse(data);
    const { prompt } = parsed;

    const generatedData = await generateExerciseData(prompt);

    // Generar thumbnail usando el thumbnailPrompt generado por la AI
    const thumbnailUrl = await generateThumbnail(generatedData.thumbnailPrompt, generatedData.slug);

    const [created] = await db
      .insert(exercises)
      .values({
        ...generatedData,
        thumbnailUrl,
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
