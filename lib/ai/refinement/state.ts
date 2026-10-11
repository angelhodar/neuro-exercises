import type { ChatStatus } from "ai";
import type { ExerciseRefinementMessage } from "./agent";

type BriefPart = Extract<
  ExerciseRefinementMessage["parts"][number],
  { type: "tool-proposeExerciseBrief" }
>;
type CompleteBriefPart = Extract<
  BriefPart,
  { state: "input-available" | "output-available" }
>;

export function getRefinementState({
  messages,
  status,
  creating,
  hasError,
}: {
  messages: ExerciseRefinementMessage[];
  status: ChatStatus;
  creating: boolean;
  hasError: boolean;
}) {
  let displayBrief: CompleteBriefPart | undefined;
  for (const message of [...messages].reverse()) {
    if (message.role !== "assistant") {
      continue;
    }
    displayBrief = message.parts.findLast(
      (part): part is CompleteBriefPart =>
        part.type === "tool-proposeExerciseBrief" &&
        (part.state === "input-available" || part.state === "output-available")
    );
    if (displayBrief) {
      break;
    }
  }

  const lastMessage = messages.at(-1);
  const pendingBrief =
    displayBrief?.state === "input-available" &&
    lastMessage?.role === "assistant" &&
    lastMessage.parts.includes(displayBrief)
      ? displayBrief
      : undefined;
  const hasPendingQuestion = messages.some(
    (message) =>
      message.role === "assistant" &&
      message.parts.some(
        (part) =>
          part.type === "tool-askUserQuestion" &&
          (part.state === "input-available" || part.state === "input-streaming")
      )
  );

  return {
    canUseBrief:
      Boolean(pendingBrief) &&
      !hasPendingQuestion &&
      status === "ready" &&
      !creating &&
      !hasError,
    displayBrief,
    hasPendingQuestion,
    pendingBrief,
  };
}
