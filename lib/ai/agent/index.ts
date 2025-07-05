import { generateText } from "ai";
import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { createGenerationPrompt, systemPrompt } from "./prompts";
import { getCurrentGeneratedFiles, readFiles, writeFiles } from "./tools";
import { ExerciseChatGeneration } from "@/lib/db/schema";

interface GenerationData {
  mainGuidelinesPrompt: string;
  lastCodeBlobKey: string | null;
  lastUserPrompt: string | null;
}

function extractGenerationData(generations: ExerciseChatGeneration[]): GenerationData {
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

export async function runAgent(slug: string, generations: ExerciseChatGeneration[]): Promise<string> {
  const { mainGuidelinesPrompt, lastCodeBlobKey, lastUserPrompt } = extractGenerationData(generations);

  const { text } = await generateText({
    model: google("gemini-2.5-pro"),
    tools: {
      getCurrentGeneratedFiles,
      readFiles: readFiles(lastCodeBlobKey),
      writeFiles,
    },
    prompt: createGenerationPrompt(
      mainGuidelinesPrompt,
      lastUserPrompt,
      slug,
    ),
    system: systemPrompt,
    maxSteps: 10,
    onStepFinish: (data) => {
      console.log(data.text);
    },
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 1024,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
  });

  return text;
}
