import assert from "node:assert/strict";
import { test } from "node:test";
import type { ExerciseRefinementMessage } from "../../lib/ai/refinement/agent";
import {
  getPendingSiblingBriefs,
  getRequirementsStatus,
  shouldContinueRefinement,
  withoutUnfinishedStep,
} from "../../lib/ai/refinement/conversation";
import { getRefinementState } from "../../lib/ai/refinement/state";
import {
  type ExerciseBrief,
  exerciseRevisionSchema,
  MAX_BRIEF_FEEDBACK_LENGTH,
  proposeExerciseBriefOutputSchema,
} from "../../lib/schemas/exercise-refinement";

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

test("automatic continuation waits for tool answers and stops after approval", () => {
  const answered: Part = {
    ...question,
    output: { selected: ["Diez"] },
    state: "output-available",
  };
  const rejected: Part = {
    ...proposal,
    output: { accepted: false, feedback: "Cambiar" },
    state: "output-available",
  };
  const accepted: Part = {
    ...proposal,
    output: { accepted: true },
    state: "output-available",
  };
  assert.equal(
    shouldContinueRefinement({ messages: [assistant([question])] }),
    false
  );
  assert.equal(
    shouldContinueRefinement({ messages: [assistant([answered])] }),
    true
  );
  assert.equal(
    shouldContinueRefinement({ messages: [assistant([rejected])] }),
    true
  );
  assert.equal(
    shouldContinueRefinement({ messages: [assistant([accepted])] }),
    false
  );
  assert.equal(
    shouldContinueRefinement({ messages: [assistant([answered, proposal])] }),
    false
  );
  assert.equal(
    shouldContinueRefinement({
      messages: [assistant([{ text: "Done", type: "text" }])],
    }),
    false
  );
  assert.equal(
    shouldContinueRefinement({
      messages: [
        { id: "user", parts: [{ text: "Idea", type: "text" }], role: "user" },
      ],
    }),
    false
  );
});

test("continuation evaluates only the latest step, including tool errors", () => {
  const failed: Part = {
    ...question,
    errorText: "Failed",
    state: "output-error",
  };
  assert.equal(
    shouldContinueRefinement({
      messages: [assistant([proposal, { type: "step-start" }, failed])],
    }),
    true
  );
});

test("retry drops only an unfinished latest step and does not mutate history", () => {
  const text: Part = { text: "Earlier step", type: "text" };
  const messages = [assistant([text, { type: "step-start" }, question])];
  const before = structuredClone(messages);
  assert.deepEqual(withoutUnfinishedStep(messages), [assistant([text])]);
  assert.deepEqual(messages, before);
  const noMarker: ExerciseRefinementMessage[] = [
    { id: "assistant", parts: [question], role: "assistant" },
  ];
  assert.deepEqual(withoutUnfinishedStep(noMarker), []);
  const complete = [assistant([text])];
  assert.equal(withoutUnfinishedStep(complete), complete);
  assert.equal(withoutUnfinishedStep([]).length, 0);
});

test("sibling proposals are invalidated for questions, not text or themselves", () => {
  assert.deepEqual(getPendingSiblingBriefs(question, [proposal]), [proposal]);
  assert.deepEqual(getPendingSiblingBriefs(proposal, [proposal]), []);
  assert.deepEqual(
    getPendingSiblingBriefs({ text: "Test", type: "text" }, [proposal]),
    []
  );
});

test("requirements status preserves priority and has no warning for ready briefs", () => {
  const ready = {
    busy: false,
    canUseBrief: true,
    creating: false,
    hasPendingQuestion: false,
  };
  assert.equal(getRequirementsStatus(ready), undefined);
  assert.equal(
    getRequirementsStatus({ ...ready, canUseBrief: false }),
    "Reintenta la revisión para completar la propuesta."
  );
  assert.equal(
    getRequirementsStatus({ ...ready, hasPendingQuestion: true }),
    "Responde a las preguntas pendientes antes de crear el ejercicio."
  );
  assert.equal(
    getRequirementsStatus({ ...ready, busy: true, hasPendingQuestion: true }),
    "Actualizando los requisitos..."
  );
  assert.equal(
    getRequirementsStatus({ ...ready, busy: true, creating: true }),
    "Creando el ejercicio con esta especificación."
  );
});

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
