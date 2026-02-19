import { getExerciseBySlug } from "@/app/actions/exercises";
import {
  createExerciseGeneration,
  getExerciseGenerations,
} from "@/app/actions/generations";
import { createExerciseAgent } from "@/lib/ai/agent/agent";
import { getAgentSandbox } from "@/lib/ai/agent/sandbox";
import {
  createAgentTools,
  writePreviousGenToSandbox,
} from "@/lib/ai/agent/tools";
import { createConversationHistory } from "@/lib/ai/agent/utils";

export async function POST(req: Request) {
  const { messages, slug } = await req.json();

  const lastMessage = messages.at(-1);

  if (!lastMessage || lastMessage.role !== "user") {
    return new Response("No user message found", { status: 400 });
  }

  const lastMessageContent =
    lastMessage.content ??
    lastMessage.parts
      ?.filter((p: { type: string }) => p.type === "text")
      .map((p: { text: string }) => p.text)
      .join("\n") ??
    "";

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) {
    return new Response("Exercise not found", { status: 404 });
  }

  const generations = await getExerciseGenerations(exercise.id);

  if (generations.length === 0) {
    return new Response("No generation to process", { status: 400 });
  }

  if (generations.at(-1)?.status === "COMPLETED") {
    const newGeneration = await createExerciseGeneration({
      exerciseId: exercise.id,
      prompt: lastMessageContent,
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

  const {
    messages: conversationMessages,
    lastCodeBlobKey,
    lastSandboxId,
  } = createConversationHistory(generations, slug);

  const sandbox = await getAgentSandbox(lastSandboxId);
  await writePreviousGenToSandbox(sandbox, lastCodeBlobKey);

  const tools = createAgentTools(sandbox, lastGeneration.id, lastCodeBlobKey);
  const agent = createExerciseAgent({
    tools,
    sandbox,
    generationId: lastGeneration.id,
  });

  const result = await agent.stream({ messages: conversationMessages });

  return result.toUIMessageStreamResponse();
}
