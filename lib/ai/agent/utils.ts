import { ExerciseChatGeneration } from "@/lib/db/schema";

interface GenerationData {
  mainGuidelinesPrompt: string;
  lastCodeBlobKey: string | null;
  lastUserPrompt: string | null;
}

export function extractGenerationData(
  generations: ExerciseChatGeneration[],
): GenerationData {
  if (generations.length === 0) {
    throw new Error("No generations provided");
  }

  const [mainGeneration] = generations;
  const lastGeneration = generations.at(-1);
  const previousGeneration = generations.at(-2); // Second to last generation

  return {
    mainGuidelinesPrompt: mainGeneration.prompt,
    lastCodeBlobKey: previousGeneration?.codeBlobKey || null,
    lastUserPrompt: generations.length > 1 ? lastGeneration!.prompt : null,
  };
}
