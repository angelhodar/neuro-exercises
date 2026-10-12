"use client";

import { useChat } from "@ai-sdk/react";
import { type ChatAddToolOutputFunction, DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createRequirementDraft } from "@/app/actions/exercise-requirement-drafts";
import { createExercise } from "@/app/actions/exercises";
import type { ExerciseRefinementMessage } from "@/lib/ai/refinement/agent";
import {
  getRequirementsStatus,
  shouldContinueRefinement,
  withoutUnfinishedStep,
} from "@/lib/ai/refinement/conversation";
import { getRefinementState } from "@/lib/ai/refinement/state";
import { exerciseRevisionSchema } from "@/lib/schemas/exercise-refinement";
import type { ExerciseIdeaSchema } from "@/lib/schemas/exercises";

export interface RequirementDraft {
  id: string;
  messages: ExerciseRefinementMessage[];
  revision: number;
}

export function useExerciseCreation(initialDraft?: RequirementDraft) {
  const router = useRouter();
  const [started, setStarted] = useState(Boolean(initialDraft));
  const draftId = useRef(initialDraft?.id);
  const draftRevision = useRef(initialDraft?.revision ?? 0);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  // This synchronous guard prevents a second action before React renders.
  const creationInProgress = useRef<boolean>(false);

  const {
    addToolOutput,
    error,
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
  } = useChat<ExerciseRefinementMessage>({
    messages: initialDraft?.messages,
    sendAutomaticallyWhen: shouldContinueRefinement,
    transport: new DefaultChatTransport({
      api: "/api/exercise-refinement",
      body: () => ({
        draftId: draftId.current,
        revision: draftRevision.current,
      }),
      credentials: "include",
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        const revision = response.headers.get("x-draft-revision");
        if (revision !== null) {
          draftRevision.current = Number(revision);
        }
        return response;
      },
    }),
  });

  const busy = status === "submitted" || status === "streaming";
  const { displayBrief, pendingBrief, hasPendingQuestion, canUseBrief } =
    getRefinementState({
      creating,
      hasError: Boolean(error),
      messages,
      status,
    });
  const requirementsStatus = getRequirementsStatus({
    busy,
    canUseBrief,
    creating,
    hasPendingQuestion,
  });

  const addRefinementToolOutput: ChatAddToolOutputFunction<
    ExerciseRefinementMessage
  > = async (options) => {
    if (creationInProgress.current) {
      return;
    }
    await addToolOutput(options);
  };

  async function startRefinement(values: ExerciseIdeaSchema) {
    setDraftError(null);
    try {
      const draft = await createRequirementDraft(values.prompt);
      draftId.current = draft.id;
      draftRevision.current = 0;
      const url = new URL(window.location.href);
      url.searchParams.set("draft", draft.id);
      window.history.replaceState(null, "", url);
      setStarted(true);
    } catch {
      setDraftError("No se pudo guardar el borrador. Inténtalo de nuevo.");
      return;
    }
    await sendMessage({ text: values.prompt });
  }

  async function handleCreate() {
    if (!(canUseBrief && pendingBrief) || creationInProgress.current) {
      return;
    }
    const { brief } = pendingBrief.input;
    creationInProgress.current = true;
    setCreating(true);
    setCreationError(null);
    try {
      const created = await createExercise({
        brief,
        draftId: draftId.current,
        draftRevision: draftRevision.current,
      });
      if (!created) {
        throw new Error("Failed to create exercise");
      }
      router.push(`/dashboard/exercises/${created.slug}`);
    } catch {
      creationInProgress.current = false;
      setCreationError(
        "No se pudo preparar el ejercicio. Revisa la propuesta e inténtalo de nuevo."
      );
      setCreating(false);
    }
  }

  function retryRefinement() {
    if (creationInProgress.current) {
      return Promise.resolve();
    }
    setMessages(withoutUnfinishedStep);
    return sendMessage();
  }

  async function reviseBrief(feedback: string) {
    if (!(canUseBrief && pendingBrief) || creationInProgress.current) {
      throw new Error("La propuesta todavía no está lista para editarse");
    }
    const input = exerciseRevisionSchema.parse({ feedback });
    setCreationError(null);
    await addRefinementToolOutput({
      output: { accepted: false, feedback: input.feedback },
      tool: "proposeExerciseBrief",
      toolCallId: pendingBrief.toolCallId,
    });
  }

  function showDrafts() {
    setStarted(false);
    setMessages([]);
    router.refresh();
  }

  return {
    addRefinementToolOutput,
    busy,
    canUseBrief,
    creating,
    creationError,
    displayBrief,
    draftError,
    error,
    handleCreate,
    messages,
    needsContinuation:
      !(busy || error || creating) &&
      (messages.at(-1)?.role === "user" ||
        shouldContinueRefinement({ messages })),
    requirementsStatus,
    retryRefinement,
    reviseBrief,
    showDrafts,
    started,
    startRefinement,
    status,
    stop,
  };
}
