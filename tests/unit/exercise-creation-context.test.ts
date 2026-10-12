import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  useExerciseCreationActions,
  useExerciseCreationState,
} from "../../app/dashboard/exercises/create/exercise-creation-context";

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
