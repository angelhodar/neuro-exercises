import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { redactAttachment, redactError } from "../support/secret-reporter";

test("privileged credentials are redacted from errors and nested causes", () => {
  const error = {
    cause: { message: "Bearer synthetic-fixture-secret" },
    message: "Request failed with synthetic-bypass-secret",
    snippet: "synthetic-fixture-secret",
    stack: "synthetic-bypass-secret",
    value: "synthetic-fixture-secret",
  };
  redactError(error, [
    "synthetic-fixture-secret",
    "synthetic-bypass-secret",
    "",
  ]);
  assert.deepEqual(error, {
    cause: { message: "Bearer [redacted]" },
    message: "Request failed with [redacted]",
    snippet: "[redacted]",
    stack: "[redacted]",
    value: "[redacted]",
  });
});

test("credential redaction tolerates shared or cyclic error causes", () => {
  const error: { cause?: typeof error; message: string } = {
    message: "synthetic-secret",
  };
  error.cause = error;
  redactError(error, ["synthetic-secret"]);
  assert.equal(error.message, "[redacted]");
});

test("generated text attachments are redacted without rewriting source files", (t) => {
  mkdirSync("test-results", { recursive: true });
  const directory = mkdtempSync(join("test-results", "redaction-"));
  const path = join(directory, "error-context.md");
  t.after(() => {
    unlinkSync(path);
    rmdirSync(directory);
  });
  writeFileSync(path, "Header: synthetic-bypass-secret");
  redactAttachment({ contentType: "text/markdown", path }, [
    "synthetic-bypass-secret",
  ]);
  assert.equal(readFileSync(path, "utf8"), "Header: [redacted]");
  const source = "tests/unit/secret-reporter.test.ts";
  const original = readFileSync(source, "utf8");
  redactAttachment({ contentType: "text/plain", path: source }, [
    "synthetic-bypass-secret",
  ]);
  assert.equal(readFileSync(source, "utf8"), original);
  const attachment = {
    body: Buffer.from("synthetic-bypass-secret"),
    contentType: "text/plain",
  };
  redactAttachment(attachment, ["synthetic-bypass-secret"]);
  assert.equal(attachment.body.toString(), "[redacted]");
});
