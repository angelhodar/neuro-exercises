import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { NextRequest } from "next/server";
import type { ExerciseRefinementMessage } from "../lib/ai/refinement/agent";
import { getRefinementState } from "../lib/ai/refinement/state";
import {
  type ExerciseBrief,
  exerciseRevisionSchema,
  MAX_BRIEF_FEEDBACK_LENGTH,
  proposeExerciseBriefOutputSchema,
} from "../lib/schemas/exercise-refinement";

const brief: ExerciseBrief = {
  accessibilityConsiderations: [],
  completionCriteria: "Diez intentos",
  configurableParameters: ["Número de intentos"],
  difficultyAndProgression: "Dificultad fija",
  feedback: "Indicar si la respuesta es correcta",
  resultsToRecord: ["Aciertos"],
  stimuli: ["Imágenes"],
  summary: "Ejercicio de atención",
  taskFlow: ["Mostrar una imagen", "Registrar la respuesta"],
};

type Part = ExerciseRefinementMessage["parts"][number];
const proposal: Part = {
  input: { brief },
  state: "input-available",
  toolCallId: "brief-1",
  type: "tool-proposeExerciseBrief",
};
const question: Part = {
  input: { question: "¿Cuántos intentos?" },
  state: "input-available",
  toolCallId: "question-1",
  type: "tool-askUserQuestion",
};

function assistant(
  parts: Part[],
  id = "assistant-1"
): ExerciseRefinementMessage {
  return { id, parts: [{ type: "step-start" }, ...parts], role: "assistant" };
}

function state(messages: ExerciseRefinementMessage[]) {
  return getRefinementState({
    creating: false,
    hasError: false,
    messages,
    status: "ready",
  });
}

test("valid revision feedback fits the tool output schema and is trimmed", () => {
  const input = exerciseRevisionSchema.parse({
    feedback: "  Aumenta la dificultad  ",
  });
  assert.equal(input.feedback, "Aumenta la dificultad");
  assert.ok(
    proposeExerciseBriefOutputSchema.safeParse({
      accepted: false,
      feedback: input.feedback,
    }).success
  );
  assert.ok(
    exerciseRevisionSchema.safeParse({
      feedback: "x".repeat(MAX_BRIEF_FEEDBACK_LENGTH),
    }).success
  );
});

test("empty or oversized feedback is rejected before the proposed brief changes", () => {
  const messages = [assistant([proposal])];
  assert.equal(
    exerciseRevisionSchema.safeParse({ feedback: " " }).success,
    false
  );
  assert.equal(
    exerciseRevisionSchema.safeParse({
      feedback: "x".repeat(MAX_BRIEF_FEEDBACK_LENGTH + 1),
    }).success,
    false
  );
  assert.equal(state(messages).pendingBrief, proposal);
  assert.equal(state(messages).canUseBrief, true);
});

test("a brief is actionable only when no sibling question is pending", () => {
  const pending = state([assistant([question, proposal])]);
  assert.equal(pending.displayBrief, proposal);
  assert.equal(pending.hasPendingQuestion, true);
  assert.equal(pending.canUseBrief, false);

  const answered: Part = {
    input: { question: "¿Cuántos intentos?" },
    output: { freeText: "Diez", selected: [] },
    state: "output-available",
    toolCallId: "question-1",
    type: "tool-askUserQuestion",
  };
  assert.equal(state([assistant([answered, proposal])]).canUseBrief, true);
});

test("unfinished questions in earlier steps also prevent approval", () => {
  const result = state([
    assistant([question, { type: "step-start" }, proposal]),
  ]);
  assert.equal(result.canUseBrief, false);
});

test("a rejected proposal stays visible while its replacement streams", () => {
  const rejected: Part = {
    input: { brief },
    output: { accepted: false, feedback: "Aumenta la dificultad" },
    state: "output-available",
    toolCallId: "brief-1",
    type: "tool-proposeExerciseBrief",
  };
  const streaming: Part = {
    state: "input-streaming",
    toolCallId: "brief-2",
    type: "tool-proposeExerciseBrief",
  };
  const result = getRefinementState({
    creating: false,
    hasError: false,
    messages: [assistant([rejected, { type: "step-start" }, streaming])],
    status: "streaming",
  });
  assert.equal(result.displayBrief, rejected);
  assert.equal(result.pendingBrief, undefined);
  assert.equal(result.canUseBrief, false);

  const replacement: Part = {
    input: {
      brief: { ...brief, difficultyAndProgression: "Dificultad creciente" },
    },
    state: "input-available",
    toolCallId: "brief-2",
    type: "tool-proposeExerciseBrief",
  };
  const finished = state([
    assistant([rejected, { type: "step-start" }, replacement]),
  ]);
  assert.equal(finished.displayBrief, replacement);
  assert.equal(finished.canUseBrief, true);
});

test("streaming, failures, and exercise creation lock both brief actions", () => {
  const messages = [assistant([proposal])];
  for (const status of ["submitted", "streaming", "error"] as const) {
    assert.equal(
      getRefinementState({ creating: false, hasError: false, messages, status })
        .canUseBrief,
      false
    );
  }
  assert.equal(
    getRefinementState({
      creating: true,
      hasError: false,
      messages,
      status: "ready",
    }).canUseBrief,
    false
  );
  assert.equal(
    getRefinementState({
      creating: false,
      hasError: true,
      messages,
      status: "ready",
    }).canUseBrief,
    false
  );
  assert.equal(state(messages).canUseBrief, true);
});

test("an older brief is not actionable after a newer assistant response", () => {
  const result = state([
    assistant([proposal]),
    assistant([{ text: "Revisando...", type: "text" }], "assistant-2"),
  ]);
  assert.equal(result.displayBrief, proposal);
  assert.equal(result.pendingBrief, undefined);
  assert.equal(result.canUseBrief, false);
});

test("a new user message also prevents approving an older proposal", () => {
  const result = state([
    assistant([proposal]),
    {
      id: "new-request",
      parts: [{ text: "Cambia los estímulos", type: "text" }],
      role: "user",
    },
  ]);
  assert.equal(result.displayBrief, proposal);
  assert.equal(result.canUseBrief, false);
});

test("the refinement endpoint revalidates sessions instead of trusting cached cookies", async () => {
  process.env.DATABASE_URL = "postgresql://audit:audit@localhost:5432/audit";
  process.env.BETTER_AUTH_SECRET = "isolated-refinement-regression-test-secret";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  const { auth } = await import("../lib/auth/auth.server");
  const sessionLookup = mock.method(
    auth.api,
    "getSession",
    (options: Parameters<typeof auth.api.getSession>[0]) => {
      assert.equal(options?.query?.disableCookieCache, true);
      return Promise.resolve(null);
    }
  );
  try {
    const { POST } = await import("../app/api/exercise-refinement/route");
    const response = await POST(
      new NextRequest("http://localhost:3000/api/exercise-refinement", {
        headers: { cookie: "better-auth.session_data=revoked-session" },
        method: "POST",
      })
    );
    assert.equal(response.status, 401);
    assert.equal(sessionLookup.mock.callCount(), 1);
  } finally {
    sessionLookup.mock.restore();
  }
});
