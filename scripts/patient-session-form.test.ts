import assert from "node:assert/strict";
import { test } from "node:test";
import {
  sessionFormInput,
  sessionFormSchema,
} from "../app/dashboard/patients/session-form-schema";

test("session forms retain required fields and optional observations", () => {
  const input = { date: "2026-10-12", discipline: "test", type: "test" };
  assert.equal(sessionFormSchema.safeParse(input).success, true);
  for (const field of ["date", "discipline", "type"]) {
    assert.equal(
      sessionFormSchema.safeParse({ ...input, [field]: "" }).success,
      false
    );
  }
  assert.deepEqual(sessionFormInput(input), {
    date: new Date("2026-10-12"),
    discipline: "test",
    observations: null,
    type: "test",
  });
});

test("session forms preserve observation text without trimming", () => {
  const input = {
    date: "2026-10-12",
    discipline: "test",
    observations: "  note  ",
    type: "test",
  };
  assert.equal(
    sessionFormInput(sessionFormSchema.parse(input)).observations,
    "  note  "
  );
  assert.equal(
    sessionFormInput({ ...input, observations: "" }).observations,
    null
  );
});
