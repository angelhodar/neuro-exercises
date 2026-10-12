import assert from "node:assert/strict";
import { test } from "node:test";
import { testCommands } from "../support/test-commands";

test("the default command runs all three suites", () => {
  const commands = testCommands([]);
  assert.equal(commands.length, 3);
  assert.ok(commands[0].includes("tests/unit/patient-session-form.test.ts"));
  assert.ok(commands[1].includes("tests/integration/auth-security.test.ts"));
  assert.deepEqual(commands[2], [
    "--import",
    "tsx",
    "tests/support/run-e2e.ts",
  ]);
});

test("a selected file runs alone with the appropriate runner", () => {
  assert.deepEqual(testCommands(["tests/unit/patient-session-form.test.ts"]), [
    ["--import", "tsx", "--test", "tests/unit/patient-session-form.test.ts"],
  ]);
  assert.deepEqual(testCommands(["tests/e2e/auth.spec.ts"]), [
    ["--import", "tsx", "tests/support/run-e2e.ts", "tests/e2e/auth.spec.ts"],
  ]);
});

test("suite selection forwards runner options and does not append other files", () => {
  assert.deepEqual(
    testCommands([
      "unit",
      "--test-name-pattern=observation",
      "tests/unit/patient-session-form.test.ts",
    ]),
    [
      [
        "--import",
        "tsx",
        "--test",
        "--test-name-pattern=observation",
        "tests/unit/patient-session-form.test.ts",
      ],
    ]
  );
  assert.deepEqual(
    testCommands(["e2e", "--headed", "tests/e2e/auth.spec.ts"]),
    [
      [
        "--import",
        "tsx",
        "tests/support/run-e2e.ts",
        "--headed",
        "tests/e2e/auth.spec.ts",
      ],
    ]
  );
});

test("file selection groups mixed suites, removes duplicates, and rejects invalid targets", () => {
  const commands = testCommands([
    "tests/e2e/auth.spec.ts",
    "tests/unit/patient-session-form.test.ts",
    "tests/unit/patient-session-form.test.ts",
  ]);
  assert.equal(commands.length, 2);
  assert.equal(
    commands[0].filter(
      (arg) => arg === "tests/unit/patient-session-form.test.ts"
    ).length,
    1
  );
  assert.throws(() => testCommands(["tests/unit/missing.test.ts"]));
  assert.throws(() => testCommands(["tests/support/database.ts"]));
});
