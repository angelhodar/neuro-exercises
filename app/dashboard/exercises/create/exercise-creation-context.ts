"use client";

import type { ChatStatus } from "ai";
import { createContext, use } from "react";
import type { ExerciseRefinementMessage } from "@/lib/ai/refinement/agent";
import type { ProposeBriefPart } from "@/lib/ai/refinement/conversation";
import type { getRefinementState } from "@/lib/ai/refinement/state";
import type { AskUserQuestionOutput } from "@/lib/schemas/exercise-refinement";
import type { ExerciseIdeaSchema } from "@/lib/schemas/exercises";

export interface ExerciseCreationState {
  busy: boolean;
  canUseBrief: boolean;
  creating: boolean;
  creationError: string | null;
  displayBrief: ReturnType<typeof getRefinementState>["displayBrief"];
  draftError: string | null;
  error: Error | undefined;
  messages: ExerciseRefinementMessage[];
  needsContinuation: boolean;
  requirementsStatus: string | undefined;
  started: boolean;
  status: ChatStatus;
}

export interface ExerciseCreationActions {
  answerQuestion: (
    toolCallId: string,
    answer: AskUserQuestionOutput,
    siblingBriefs: ProposeBriefPart[]
  ) => void;
  handleCreate: () => Promise<void>;
  retryRefinement: () => Promise<void>;
  reviseBrief: (feedback: string) => Promise<void>;
  showDrafts: () => void;
  startRefinement: (values: ExerciseIdeaSchema) => Promise<void>;
  stop: () => void;
}

export const ExerciseCreationStateContext =
  createContext<ExerciseCreationState | null>(null);
export const ExerciseCreationActionsContext =
  createContext<ExerciseCreationActions | null>(null);

export function useExerciseCreationState() {
  const state = use(ExerciseCreationStateContext);
  if (!state) {
    throw new Error(
      "Exercise creation components require an ExerciseCreationProvider"
    );
  }
  return state;
}

export function useExerciseCreationActions() {
  const actions = use(ExerciseCreationActionsContext);
  if (!actions) {
    throw new Error(
      "Exercise creation components require an ExerciseCreationProvider"
    );
  }
  return actions;
}
