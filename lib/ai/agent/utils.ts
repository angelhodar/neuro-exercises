import type { ModelMessage } from "ai";
import type { ExerciseChatGeneration } from "@/lib/db/schema";

interface ConversationData {
  messages: ModelMessage[];
  lastCodeBlobKey: string | null;
}

/**
 * Builds the ancestor chain for a given generation by following forkedFromId links.
 * For linear (non-forked) generations, walks backward through chronological order.
 */
function buildAncestorChain(
  generations: ExerciseChatGeneration[],
  targetId: number
): ExerciseChatGeneration[] {
  const byId = new Map(generations.map((g) => [g.id, g]));
  const indexById = new Map(generations.map((g, i) => [g.id, i]));

  const chain: ExerciseChatGeneration[] = [];
  let currentId: number | null = targetId;

  while (currentId !== null) {
    const gen = byId.get(currentId);
    if (!gen) break;
    chain.unshift(gen);

    if (gen.forkedFromId) {
      // Follow the explicit fork link
      currentId = gen.forkedFromId;
    } else {
      // Linear parent: include all chronological predecessors
      const idx = indexById.get(gen.id);
      if (idx !== undefined && idx > 0) {
        chain.unshift(...generations.slice(0, idx));
      }
      break;
    }
  }

  return chain;
}

export function createConversationHistory(
  generations: ExerciseChatGeneration[],
  slug: string,
  forkBaseId?: number
): ConversationData {
  const firstGeneration = generations.at(0);

  if (!firstGeneration) {
    throw new Error("No generations available");
  }

  // When forking, use only the ancestor chain up to the fork base
  const effectiveGenerations = forkBaseId
    ? buildAncestorChain(generations, forkBaseId)
    : generations;

  const messages: ModelMessage[] = [];
  let lastCodeBlobKey: string | null = null;

  // First generation's prompt becomes the initial user message with guidelines + slug context
  const initialMessage = `
The initial guidelines for the exercise are:

<initial-guidelines>
${effectiveGenerations[0].prompt}
</initial-guidelines>

The exercise slug is:

<slug>
${slug}
</slug>
`;

  messages.push({ role: "user", content: initialMessage });

  // For each generation, add the assistant summary and the next generation's prompt
  for (let i = 0; i < effectiveGenerations.length; i++) {
    const generation = effectiveGenerations[i];

    // Track the most recent codeBlobKey before the current (last) generation
    if (i < effectiveGenerations.length - 1 && generation.codeBlobKey) {
      lastCodeBlobKey = generation.codeBlobKey;
    }

    if (generation.summary) {
      messages.push({ role: "assistant", content: generation.summary });
    }

    // Add the next generation's prompt as a user message
    const nextGeneration = effectiveGenerations[i + 1];

    if (nextGeneration) {
      messages.push({ role: "user", content: nextGeneration.prompt });
    }
  }

  // For forks, ensure the lastCodeBlobKey is the fork base's codeBlobKey
  if (forkBaseId) {
    const forkBase = effectiveGenerations.find((g) => g.id === forkBaseId);
    if (forkBase?.codeBlobKey) {
      lastCodeBlobKey = forkBase.codeBlobKey;
    }
  }

  return { messages, lastCodeBlobKey };
}
