import { streamText } from "ai";

import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { createGenerationPrompt, systemPrompt } from "@/lib/ai/agent/prompts";
import {
  getCurrentGeneratedFiles,
  readFiles,
  writeFiles,
} from "@/lib/ai/agent/tools";
import { extractGenerationData } from "@/lib/ai/agent/utils";
import { getExerciseBySlug } from "@/app/actions/exercises";
import {
  getExerciseGenerations,
  createExerciseGeneration,
  updateExerciseGeneration,
} from "@/app/actions/generations";

export async function POST(req: Request) {
  const { messages, slug } = await req.json();

  const lastMessage = messages[messages.length - 1];

  if (!lastMessage || lastMessage.role !== "user") {
    return new Response("No user message found", { status: 400 });
  }

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) {
    return new Response("Exercise not found", { status: 404 });
  }

  const newGeneration = await createExerciseGeneration({
    exerciseId: exercise.id,
    prompt: lastMessage.content,
  });

  if (!newGeneration) {
    return new Response("Failed to create generation", { status: 500 });
  }

  const generations = await getExerciseGenerations(exercise.id);

  const { mainGuidelinesPrompt, lastCodeBlobKey, lastUserPrompt } =
    extractGenerationData(generations);

  const stream = streamText({
    model: google("gemini-2.5-pro"),
    tools: {
      getCurrentGeneratedFiles,
      readFiles: readFiles(lastCodeBlobKey),
      writeFiles: writeFiles(newGeneration.id),
    },
    prompt: createGenerationPrompt(mainGuidelinesPrompt, lastUserPrompt, slug),
    system: systemPrompt,
    maxSteps: 10,
    onStepFinish: (data) => {
      console.log(data.text);
    },
    onFinish: async (data) => {
      console.log("Stream finished, updating generation...");

      /*let codeBlobKey: string | null = null;

      if (data.toolResults) {
        for (const toolResult of data.toolResults) {
          if (toolResult.toolName === "writeFiles" && toolResult.result) {
            codeBlobKey = toolResult.result;
            break;
          }
        }
      }

      console.log(data.toolResults)*/

      await updateExerciseGeneration(newGeneration.id, {
        status: "COMPLETED",
        summary: data.text,
      });
    },
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 512,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
  });

  return stream.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (error == null) {
        return "unknown error";
      }

      if (typeof error === "string") {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}
