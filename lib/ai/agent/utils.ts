import type { ModelMessage } from "ai";
import type { ExerciseChatGeneration } from "@/lib/db/schema";

interface ConversationData {
  lastCodeBlobKey: string | null;
  messages: ModelMessage[];
}

export function createConversationHistory(
  generations: ExerciseChatGeneration[]
): ConversationData {
  const firstGeneration = generations.at(0);

  if (!firstGeneration) {
    throw new Error("No generations available");
  }

  const messages: ModelMessage[] = [];
  let lastCodeBlobKey: string | null = null;

  // First generation's prompt is the initial user message
  messages.push({ content: firstGeneration.prompt, role: "user" });

  // For each generation, add the assistant summary and the next generation's prompt
  for (let i = 0; i < generations.length; i += 1) {
    const generation = generations[i];

    // Track the most recent codeBlobKey before the current (last) generation
    if (i < generations.length - 1 && generation.codeBlobKey) {
      lastCodeBlobKey = generation.codeBlobKey;
    }

    if (generation.summary) {
      messages.push({ content: generation.summary, role: "assistant" });
    }

    // Add the next generation's prompt as a user message
    const nextGeneration = generations[i + 1];

    if (nextGeneration) {
      messages.push({ content: nextGeneration.prompt, role: "user" });
    }
  }

  return { lastCodeBlobKey, messages };
}
