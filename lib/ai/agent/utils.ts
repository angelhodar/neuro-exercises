import type { ModelMessage } from "ai";
import type { ExerciseChatGeneration } from "@/lib/db/schema";

interface ConversationData {
  messages: ModelMessage[];
  lastCodeBlobKey: string | null;
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
  messages.push({ role: "user", content: firstGeneration.prompt });

  // For each generation, add the assistant summary and the next generation's prompt
  for (let i = 0; i < generations.length; i++) {
    const generation = generations[i];

    // Track the most recent codeBlobKey before the current (last) generation
    if (i < generations.length - 1 && generation.codeBlobKey) {
      lastCodeBlobKey = generation.codeBlobKey;
    }

    if (generation.summary) {
      messages.push({ role: "assistant", content: generation.summary });
    }

    // Add the next generation's prompt as a user message
    const nextGeneration = generations[i + 1];

    if (nextGeneration) {
      messages.push({ role: "user", content: nextGeneration.prompt });
    }
  }

  return { messages, lastCodeBlobKey };
}
