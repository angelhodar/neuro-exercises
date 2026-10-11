import {
  consumeStream,
  createAgentUIStreamResponse,
  type UIMessage,
  validateUIMessages,
} from "ai";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  type ExerciseRefinementMessage,
  exerciseRefinementAgent,
} from "@/lib/ai/refinement/agent";
import {
  findRequirementDraft,
  saveRequirementDraftResponse,
  saveRequirementDraftTurn,
} from "@/lib/ai/refinement/draft-repository";
import { getAuthSession } from "@/lib/auth/require-auth";

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
  const session = await getAuthSession(request.headers);
  if (!session?.user) {
    return new Response("No autorizado", { status: 401 });
  }

  let messages: ExerciseRefinementMessage[];
  let draftId: string;
  let revision: number;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    draftId = z.uuid().parse(body.draftId);
    revision = z.number().int().min(0).parse(body.revision);
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

  const draft = await findRequirementDraft(draftId, session.user.id);
  if (!draft) {
    return new Response("Borrador no encontrado", { status: 404 });
  }
  const saved = await saveRequirementDraftTurn({
    creatorId: session.user.id,
    id: draftId,
    messages,
    revision,
  });
  if (!saved) {
    return new Response(
      "El borrador cambió en otra pestaña. Recarga para continuar.",
      { status: 409 }
    );
  }
  const headers = { "x-draft-revision": String(saved.revision) };
  try {
    return await createAgentUIStreamResponse({
      abortSignal: request.signal,
      agent: exerciseRefinementAgent,
      consumeSseStream: consumeStream,
      headers,
      onEnd: async ({ messages: completedMessages, isAborted, outcome }) => {
        if (isAborted || outcome.status !== "completed") {
          return;
        }
        await saveRequirementDraftResponse({
          creatorId: session.user.id,
          id: draftId,
          messages: await validateUIMessages<ExerciseRefinementMessage>({
            messages: completedMessages,
            tools: exerciseRefinementAgent.tools,
          }),
          revision: saved.revision,
        });
      },
      options: {
        canAskQuestion: questionsAsked < MAX_REFINEMENT_QUESTIONS,
        isRevisingBrief: isRevisingBrief(messages),
        questionsAsked,
      },
      uiMessages: messages,
    });
  } catch (error) {
    console.error("Error refining exercise requirements:", error);
    return new Response(
      "No se pudo completar la revisión. Reintenta el borrador.",
      {
        headers,
        status: 500,
      }
    );
  }
}
