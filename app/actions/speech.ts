"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/users";
import { transcribeWithGateway } from "@/lib/ai/transcribe";
import { db } from "@/lib/db";
import { speechTexts, transcriptionResults } from "@/lib/db/schema";

export interface TranscriptionResult {
  confidence?: number;
  language?: string;
  text: string;
}

export interface CreateTranscriptionResultData {
  accuracy: number;
  audioBlobKey: string;
  matchingWords: number;
  nonMatchingWords: number;
  referenceText: string;
  transcribedText: string;
}

export async function transcribeAudio(
  formData: FormData
): Promise<TranscriptionResult> {
  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    throw new Error("No audio file provided");
  }
  if (!audioFile.type.startsWith("audio/")) {
    throw new Error("Invalid file type");
  }
  if (audioFile.size > 10 * 1024 * 1024) {
    throw new Error("File too large");
  }

  const text = await transcribeWithGateway(audioFile);
  revalidatePath("/dashboard/speech-recognition");
  return { language: "es", text };
}

export async function getSpeechTexts() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return await db.query.speechTexts.findMany({
    orderBy: speechTexts.createdAt,
    where: eq(speechTexts.userId, user.id),
  });
}

export async function createSpeechText(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const referenceText = formData.get("referenceText") as string;

  if (!(name && referenceText)) {
    throw new Error("Name and reference text are required");
  }

  await db.insert(speechTexts).values({
    name,
    referenceText,
    userId: user.id,
  });

  revalidatePath("/dashboard/speech-texts");
  revalidatePath("/dashboard/speech-recognition");
}

export async function updateSpeechText(id: number, formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const referenceText = formData.get("referenceText") as string;

  if (!(name && referenceText)) {
    throw new Error("Name and reference text are required");
  }

  await db
    .update(speechTexts)
    .set({
      name,
      referenceText,
    })
    .where(and(eq(speechTexts.id, id), eq(speechTexts.userId, user.id)));

  revalidatePath("/dashboard/speech-texts");
  revalidatePath("/dashboard/speech-recognition");
}

export async function deleteSpeechText(id: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(speechTexts)
    .where(and(eq(speechTexts.id, id), eq(speechTexts.userId, user.id)));

  revalidatePath("/dashboard/speech-texts");
  revalidatePath("/dashboard/speech-recognition");
}

// Transcription Results Actions
export async function getTranscriptionResults() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return await db.query.transcriptionResults.findMany({
    orderBy: transcriptionResults.createdAt,
    where: eq(transcriptionResults.targetUserId, user.id),
    with: {
      referenceText: {
        columns: {
          id: true,
          name: true,
          referenceText: true,
        },
      },
    },
  });
}

export async function createTranscriptionResult(
  data: CreateTranscriptionResultData
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const {
    referenceText,
    transcribedText,
    audioBlobKey,
    accuracy,
    matchingWords,
    nonMatchingWords,
  } = data;

  if (!(referenceText && transcribedText && audioBlobKey)) {
    throw new Error("Missing required fields");
  }

  // Find the reference text by its content
  const referenceTextEntry = await db.query.speechTexts.findFirst({
    where: eq(speechTexts.referenceText, referenceText),
  });

  if (!referenceTextEntry) {
    throw new Error("Reference text not found");
  }

  await db.insert(transcriptionResults).values({
    accuracy,
    audioBlobKey,
    matchingWords,
    nonMatchingWords,
    referenceTextId: referenceTextEntry.id,
    targetUserId: user.id,
    transcribedText,
  });

  revalidatePath("/dashboard/speech-transcriptions");
  revalidatePath("/dashboard/speech-recognition");
}
