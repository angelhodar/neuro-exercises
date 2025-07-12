import { ExerciseChatGeneration } from "@/lib/db/schema";

interface GenerationData {
  mainGuidelinesPrompt: string;
  lastCodeBlobKey: string | null;
  lastUserPrompt: string | null;
}

export function extractGenerationData(
  generations: ExerciseChatGeneration[],
): GenerationData {
  const mainGeneration = generations.at(0)!;
  const lastGeneration = generations.at(-1);
  const previousGeneration = generations.at(-2);

  return {
    mainGuidelinesPrompt: mainGeneration.prompt,
    lastCodeBlobKey: previousGeneration?.codeBlobKey || null,
    lastUserPrompt: generations.length > 1 ? lastGeneration!.prompt : null,
  };
}
