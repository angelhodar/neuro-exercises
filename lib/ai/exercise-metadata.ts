import { generateImage, generateText, Output } from "ai";
import { generatedExerciseSchema } from "@/lib/schemas/exercises";
import { uploadBlobPathname } from "@/lib/storage";
import { generateAudio } from "./audio";

export async function generateExerciseData(prompt: string) {
  const { output } = await generateText({
    instructions:
      "Eres un especialista en neuropsicología y diseño de ejercicios cognitivos. Tu tarea es generar metadatos completos para un ejercicio neurocognitivo basándote en la descripción del usuario. Cada campo del objeto que generes debe seguir exactamente las especificaciones descritas",
    model: "google/gemini-3.8-flash",
    output: Output.object({ schema: generatedExerciseSchema }),
    prompt,
  });
  if (!output) {
    throw new Error("Failed to generate exercise data");
  }
  return output;
}

export async function generateThumbnail(
  thumbnailPrompt: string,
  slug: string
): Promise<string | null> {
  try {
    const { images } = await generateImage({
      model: "spacexai/grok-imagine-image-2.0",
      prompt: `Generate an image of ${thumbnailPrompt.toLowerCase()}, clear and simple, centered, white background`,
      size: "512x512",
    });
    const [image] = images;
    if (!image) {
      throw new Error("Error generating thumbnail");
    }
    return await uploadBlobPathname(
      `thumbnails/${slug}.png`,
      Buffer.from(image.uint8Array)
    );
  } catch (error) {
    console.error("Error generando thumbnail:", error);
    return null;
  }
}

export async function generateAudioInstructions(
  audioPrompt: string,
  slug: string
): Promise<string | null> {
  try {
    const audioBuffer = await generateAudio(audioPrompt);
    return await uploadBlobPathname(`audio/${slug}.mp3`, audioBuffer);
  } catch (error) {
    console.error("Error generando audio:", error);
    return null;
  }
}
