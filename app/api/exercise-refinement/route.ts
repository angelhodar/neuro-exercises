import {
  createAgentUIStreamResponse,
  type UIMessage,
  validateUIMessages,
} from "ai";
import type { NextRequest } from "next/server";
import {
  type ExerciseRefinementMessage,
  exerciseRefinementAgent,
} from "@/lib/ai/refinement/agent";
import { auth } from "@/lib/auth/auth.server";

const MAX_REFINEMENT_QUESTIONS = 3;
const MAX_REFINEMENT_PAYLOAD_LENGTH = 250_000;
const MAX_TEXT_PART_LENGTH = 5000;

function countAskedQuestions(messages: UIMessage[]) {
  return messages.reduce(
    (count, message) =>
      count +
      message.parts.filter((part) => part.type === "tool-askUserQuestion")
        .length,
    0
  );
}

function isRevisingBrief(messages: ExerciseRefinementMessage[]) {
  const lastMessage = messages.at(-1);
  if (lastMessage?.role !== "assistant") {
    return false;
  }

  const latestBrief = lastMessage.parts.findLast(
    (part): part is ProposeBriefPart =>
      part.type === "tool-proposeExerciseBrief"
  );
  return (
    latestBrief?.state === "output-available" && !latestBrief.output.accepted
  );
}

type ProposeBriefPart = Extract<
  ExerciseRefinementMessage["parts"][number],
  { type: "tool-proposeExerciseBrief" }
>;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return new Response("No autorizado", { status: 401 });
  }

  let messages: ExerciseRefinementMessage[];
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!Array.isArray(body.messages)) {
      throw new Error("Invalid request body");
    }
    if (JSON.stringify(body.messages).length > MAX_REFINEMENT_PAYLOAD_LENGTH) {
      return new Response("Solicitud demasiado grande", { status: 413 });
    }
    messages = await validateUIMessages<ExerciseRefinementMessage>({
      messages: body.messages,
      tools: exerciseRefinementAgent.tools,
    });
  } catch {
    return new Response("Solicitud no válida", { status: 400 });
  }

  const hasInvalidContent = messages.some((message) =>
    message.parts.some(
      (part) =>
        part.type === "file" ||
        (part.type === "text" && part.text.length > MAX_TEXT_PART_LENGTH)
    )
  );
  if (hasInvalidContent) {
    return new Response("Contenido no válido", { status: 400 });
  }

  const questionsAsked = countAskedQuestions(messages);

  return createAgentUIStreamResponse({
    abortSignal: request.signal,
    agent: exerciseRefinementAgent,
    options: {
      canAskQuestion: questionsAsked < MAX_REFINEMENT_QUESTIONS,
      isRevisingBrief: isRevisingBrief(messages),
      questionsAsked,
    },
    uiMessages: messages,
  });
}
