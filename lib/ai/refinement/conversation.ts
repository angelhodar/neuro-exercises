import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import type { ExerciseRefinementMessage } from "./agent";

export type AskQuestionPart = Extract<
  ExerciseRefinementMessage["parts"][number],
  { type: "tool-askUserQuestion" }
>;
export type ProposeBriefPart = Extract<
  ExerciseRefinementMessage["parts"][number],
  { type: "tool-proposeExerciseBrief" }
>;
export type RefinementTextPart = Extract<
  ExerciseRefinementMessage["parts"][number],
  { type: "text" }
>;

export function getPendingSiblingBriefs(
  part: AskQuestionPart | ProposeBriefPart | RefinementTextPart,
  pendingBriefs: ProposeBriefPart[]
) {
  if (part.type === "tool-askUserQuestion") {
    return pendingBriefs;
  }
  if (part.type === "tool-proposeExerciseBrief") {
    return pendingBriefs.filter(
      (brief) => brief.toolCallId !== part.toolCallId
    );
  }
  return [];
}

export function shouldContinueRefinement({
  messages,
}: {
  messages: ExerciseRefinementMessage[];
}) {
  const lastMessage = messages.at(-1);
  if (lastMessage?.role !== "assistant") {
    return false;
  }
  if (!lastAssistantMessageIsCompleteWithToolCalls({ messages })) {
    return false;
  }
  const latestStepStart = lastMessage.parts.findLastIndex(
    (part) => part.type === "step-start"
  );
  const latestToolParts = lastMessage.parts
    .slice(latestStepStart + 1)
    .filter(
      (part) =>
        part.type === "tool-askUserQuestion" ||
        part.type === "tool-proposeExerciseBrief"
    );
  return (
    latestToolParts.length > 0 &&
    latestToolParts.every(
      (part) =>
        part.state === "output-error" ||
        (part.state === "output-available" &&
          (part.type === "tool-askUserQuestion" || !part.output.accepted))
    )
  );
}

export function withoutUnfinishedStep(messages: ExerciseRefinementMessage[]) {
  const lastMessage = messages.at(-1);
  if (lastMessage?.role !== "assistant") {
    return messages;
  }
  const latestStepStart = lastMessage.parts.findLastIndex(
    (part) => part.type === "step-start"
  );
  const hasUnfinishedTool = lastMessage.parts
    .slice(latestStepStart + 1)
    .some(
      (part) =>
        (part.type === "tool-askUserQuestion" ||
          part.type === "tool-proposeExerciseBrief") &&
        (part.state === "input-available" || part.state === "input-streaming")
    );
  if (!hasUnfinishedTool) {
    return messages;
  }
  if (latestStepStart < 0) {
    return messages.slice(0, -1);
  }
  return [
    ...messages.slice(0, -1),
    {
      ...lastMessage,
      parts: lastMessage.parts.slice(0, latestStepStart),
    },
  ];
}

export function getRequirementsStatus({
  creating,
  busy,
  hasPendingQuestion,
  canUseBrief,
}: {
  creating: boolean;
  busy: boolean;
  hasPendingQuestion: boolean;
  canUseBrief: boolean;
}) {
  if (creating) {
    return "Creando el ejercicio con esta especificación.";
  }
  if (busy) {
    return "Actualizando los requisitos...";
  }
  if (hasPendingQuestion) {
    return "Responde a las preguntas pendientes antes de crear el ejercicio.";
  }
  if (!canUseBrief) {
    return "Reintenta la revisión para completar la propuesta.";
  }
}
