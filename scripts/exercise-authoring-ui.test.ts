import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  type ExerciseCreationActions,
  ExerciseCreationActionsContext,
  type ExerciseCreationState,
  ExerciseCreationStateContext,
  useExerciseCreationActions,
  useExerciseCreationState,
} from "../app/dashboard/exercises/create/exercise-creation-context";
import { RefinementConversation } from "../app/dashboard/exercises/create/refinement-conversation";
import {
  ExerciseCreationControls,
  RequirementsDocument,
} from "../app/dashboard/exercises/create/requirements-document";
import type { ExerciseBrief } from "../lib/schemas/exercise-refinement";

const REVISION_INPUT =
  /<textarea\b[^>]*aria-label="Cambios en los requisitos"[^>]*>/;
const QUESTION_INPUT =
  /<(?:input|textarea)\b[^>]*aria-label="Añadir una respuesta personalizada"[^>]*>/;
const DISABLED_BUTTON = /<button\b[^>]*\sdisabled=""/;

const brief: ExerciseBrief = {
  accessibilityConsiderations: [],
  completionCriteria: "Diez intentos",
  configurableParameters: [],
  difficultyAndProgression: "Fija",
  feedback: "Aciertos",
  resultsToRecord: ["Aciertos"],
  stimuli: ["Imágenes"],
  summary: "Ejercicio de atención",
  taskFlow: ["Responder"],
};
const proposal = {
  input: { brief },
  state: "input-available",
  toolCallId: "brief",
  type: "tool-proposeExerciseBrief",
} as const;
const ready: ExerciseCreationState = {
  busy: false,
  canUseBrief: true,
  creating: false,
  creationError: null,
  displayBrief: proposal,
  draftError: null,
  error: undefined,
  messages: [{ id: "assistant", parts: [proposal], role: "assistant" }],
  needsContinuation: false,
  requirementsStatus: undefined,
  started: true,
  status: "ready",
};
const actions: ExerciseCreationActions = {
  answerQuestion: () => undefined,
  handleCreate: () => Promise.resolve(),
  retryRefinement: () => Promise.resolve(),
  reviseBrief: () => Promise.resolve(),
  showDrafts: () => undefined,
  startRefinement: () => Promise.resolve(),
  stop: () => undefined,
};

function withWorkflow(state: ExerciseCreationState, child: ReactNode) {
  return createElement(
    ExerciseCreationStateContext,
    { value: state },
    createElement(ExerciseCreationActionsContext, { value: actions }, child)
  );
}

function revisionInput(html: string) {
  return html.match(REVISION_INPUT)?.[0];
}

test("brief rendering is independent of workflow and composes optional controls", () => {
  const standalone = renderToStaticMarkup(
    createElement(RequirementsDocument, { brief })
  );
  assert.ok(standalone.includes("Ejercicio de atención"));
  assert.equal(standalone.includes("Crear ejercicio"), false);
  const composed = renderToStaticMarkup(
    withWorkflow(
      ready,
      createElement(
        RequirementsDocument,
        { brief },
        createElement(ExerciseCreationControls)
      )
    )
  );
  assert.ok(composed.includes("Crear ejercicio"));
  assert.equal(DISABLED_BUTTON.test(composed), false);
});

test("creation controls preserve disabled state, loading label, and errors", () => {
  for (const state of [
    { ...ready, busy: true, canUseBrief: false, status: "streaming" as const },
    { ...ready, canUseBrief: false, creating: true },
    {
      ...ready,
      canUseBrief: false,
      creationError: "No se pudo preparar el ejercicio",
    },
  ]) {
    const html = renderToStaticMarkup(
      withWorkflow(state, createElement(ExerciseCreationControls))
    );
    assert.ok(DISABLED_BUTTON.test(html));
    assert.ok(
      html.includes(
        state.creating ? "Preparando ejercicio..." : "Crear ejercicio"
      )
    );
    if (state.creationError) {
      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes(state.creationError));
    }
  }
});

test("revision controls read readiness from the same workflow as creation controls", () => {
  const readyHtml = renderToStaticMarkup(
    withWorkflow(ready, createElement(RefinementConversation))
  );
  assert.ok(revisionInput(readyHtml));
  assert.equal(revisionInput(readyHtml)?.includes(' disabled=""'), false);
  for (const state of [
    { ...ready, busy: true, canUseBrief: false, status: "streaming" as const },
    { ...ready, canUseBrief: false, creating: true },
    {
      ...ready,
      canUseBrief: false,
      error: new Error("Falló la revisión"),
      status: "error" as const,
    },
  ]) {
    const html = renderToStaticMarkup(
      withWorkflow(state, createElement(RefinementConversation))
    );
    assert.ok(revisionInput(html)?.includes(' disabled=""'));
    if (state.busy) {
      assert.ok(html.includes("Revisando los requisitos..."));
    }
    if (state.error) {
      assert.ok(html.includes("Falló la revisión"));
      assert.ok(html.includes("Reintentar"));
    }
  }
  const noBrief = renderToStaticMarkup(
    withWorkflow(
      { ...ready, displayBrief: undefined, messages: [] },
      createElement(RefinementConversation)
    )
  );
  assert.equal(revisionInput(noBrief), undefined);
});

test("pending question controls are disabled during streaming and creation", () => {
  const question: ExerciseCreationState = {
    ...ready,
    canUseBrief: false,
    messages: [
      {
        id: "question",
        parts: [
          {
            input: { question: "¿Cuántos intentos?" },
            state: "input-available",
            toolCallId: "question",
            type: "tool-askUserQuestion",
          },
        ],
        role: "assistant",
      },
    ],
  };
  for (const state of [
    { ...question, busy: true, status: "streaming" as const },
    { ...question, creating: true },
  ]) {
    const html = renderToStaticMarkup(
      withWorkflow(state, createElement(RefinementConversation))
    );
    assert.ok(html.includes("¿Cuántos intentos?"));
    const input = html.match(QUESTION_INPUT)?.[0];
    assert.ok(input?.includes(' disabled=""'));
  }
});

test("workflow consumers fail clearly when rendered outside their provider", () => {
  function StateConsumer() {
    useExerciseCreationState();
    return null;
  }
  function ActionsConsumer() {
    useExerciseCreationActions();
    return null;
  }
  for (const Consumer of [StateConsumer, ActionsConsumer]) {
    assert.throws(() => renderToStaticMarkup(createElement(Consumer)), {
      message:
        "Exercise creation components require an ExerciseCreationProvider",
    });
  }
});

test("sibling workflow scopes keep their creation controls independent", () => {
  const html = renderToStaticMarkup(
    createElement(
      "div",
      null,
      withWorkflow(ready, createElement(ExerciseCreationControls)),
      withWorkflow(
        { ...ready, canUseBrief: false, creating: true },
        createElement(ExerciseCreationControls)
      )
    )
  );
  const buttons = html.match(/<button\b[^>]*>/g) ?? [];
  assert.equal(buttons.length, 2);
  assert.equal(buttons[0].includes(' disabled=""'), false);
  assert.equal(buttons[1].includes(' disabled=""'), true);
});
