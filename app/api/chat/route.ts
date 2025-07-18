import { streamText } from "ai";
import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { createGenerationPrompt, systemPrompt } from "@/lib/ai/agent/prompts";
import {
  getCodeContext,
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

  const generations = await getExerciseGenerations(exercise.id);

  if (generations.length === 0) {
    return new Response("No generation to process", { status: 400 });
  }

  if (generations.at(-1)!.status === "COMPLETED") {
    const newGeneration = await createExerciseGeneration({
      exerciseId: exercise.id,
      prompt: lastMessage.content,
      status: "GENERATING",
    });

    if (!newGeneration) {
      return new Response("Failed to create generation", { status: 500 });
    }

    generations.push(newGeneration);
  }

  const lastGeneration = generations.at(-1);

  if (!lastGeneration) {
    return new Response("Failed to create generation", { status: 500 });
  }

  const { mainGuidelinesPrompt, lastCodeBlobKey, lastUserPrompt } =
    extractGenerationData(generations);

  const stream = streamText({
    model: google("gemini-2.5-pro"),
    tools: {
      getCodeContext,
      readFiles: readFiles(lastCodeBlobKey),
      writeFiles: writeFiles(lastGeneration.id, lastCodeBlobKey),
    },
    prompt: createGenerationPrompt(mainGuidelinesPrompt, lastUserPrompt, slug),
    system: systemPrompt,
    maxSteps: 20,
    onStepFinish: (data) => {
      console.log(data.text);
    },
    onFinish: async (data) => {
      console.log("Stream finished, updating generation...");
      await updateExerciseGeneration(lastGeneration.id, {
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
