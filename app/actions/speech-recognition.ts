"use server";

import { revalidatePath } from "next/cache";
import { transcribeWithGroq } from "@/lib/ai/transcribe";

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
}

export async function transcribeAudio(formData: FormData): Promise<TranscriptionResult> {
  const audioFile = formData.get("audio") as File;
  // Validaciones mínimas
  if (!audioFile) throw new Error("No audio file provided");
  if (!audioFile.type.startsWith("audio/")) throw new Error("Invalid file type");
  if (audioFile.size > 10 * 1024 * 1024) throw new Error("File too large");

  const text = await transcribeWithGroq(audioFile);
  revalidatePath("/dashboard/speech-recognition");
  return { text, language: "es" };
}