import type {
  Reporter,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";

function redact(text: string, secrets: string[]) {
  return secrets.reduce(
    (result, secret) =>
      secret ? result.replaceAll(secret, "[redacted]") : result,
    text
  );
}

export function redactAttachment(
  attachment: { body?: Buffer; contentType: string; path?: string },
  secrets: string[]
) {
  if (
    !(
      attachment.contentType.startsWith("text/") ||
      attachment.contentType === "application/json"
    )
  ) {
    return;
  }
  if (attachment.body) {
    attachment.body = Buffer.from(redact(attachment.body.toString(), secrets));
  }
  const root = resolve("test-results");
  if (!(attachment.path && existsSync(attachment.path) && existsSync(root))) {
    return;
  }
  const path = realpathSync(attachment.path);
  const within = relative(realpathSync(root), path);
  // Only rewrite generated report artifacts, never attached source/user files.
  if (!within || within.startsWith("..") || isAbsolute(within)) {
    return;
  }
  writeFileSync(path, redact(readFileSync(path, "utf8"), secrets));
}

export function redactError(
  error: TestError,
  secrets: string[],
  seen = new Set<TestError>()
) {
  if (seen.has(error)) {
    return;
  }
  seen.add(error);
  for (const key of ["message", "stack", "snippet", "value"] as const) {
    if (error[key]) {
      error[key] = redact(error[key], secrets);
    }
  }
  if (error.cause) {
    redactError(error.cause, secrets, seen);
  }
}

export default class SecretReporter implements Reporter {
  private readonly secrets = [
    process.env.E2E_TOKEN,
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  ].filter((secret): secret is string => Boolean(secret));

  onError(error: TestError) {
    redactError(error, this.secrets);
  }

  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep) {
    if (step.error) {
      redactError(step.error, this.secrets);
    }
  }

  onTestEnd(_test: TestCase, result: TestResult) {
    for (const error of result.errors) {
      redactError(error, this.secrets);
    }
    for (const attachment of result.attachments) {
      redactAttachment(attachment, this.secrets);
    }
    for (const stream of [result.stdout, result.stderr]) {
      for (let index = 0; index < stream.length; index += 1) {
        const chunk = stream[index];
        const safe = redact(chunk.toString(), this.secrets);
        stream[index] = typeof chunk === "string" ? safe : Buffer.from(safe);
      }
    }
  }
}

import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
