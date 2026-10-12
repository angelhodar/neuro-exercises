import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deploymentHeaders,
  previewBaseUrl,
} from "../support/preview-environment";

test("remote tests require an explicit HTTPS origin and a strong fixture token", (t) => {
  const previous = process.env;
  t.after(() => {
    process.env = previous;
  });
  process.env = { ...previous, E2E_BASE_URL: "", E2E_TOKEN: "" };
  assert.equal(previewBaseUrl(), null);
  const valid = {
    ...previous,
    E2E_BASE_URL: "https://preview.example/",
    E2E_TOKEN: "synthetic-preview-token-at-least-32-characters",
  };
  process.env = valid;
  assert.equal(previewBaseUrl(), "https://preview.example");
  for (const E2E_BASE_URL of [
    "http://preview.example",
    "https://user:password@preview.example",
    "https://preview.example/path",
    "https://preview.example?token=secret",
    "https://preview.example#secret",
    "invalid",
  ]) {
    process.env = { ...valid, E2E_BASE_URL };
    assert.throws(previewBaseUrl);
  }
  process.env = { ...valid, E2E_TOKEN: "short" };
  assert.throws(previewBaseUrl);
});

test("deployment protection headers are independent of fixture authorization", (t) => {
  const previous = process.env;
  t.after(() => {
    process.env = previous;
  });
  process.env = { ...previous, VERCEL_AUTOMATION_BYPASS_SECRET: "" };
  assert.deepEqual(deploymentHeaders(), {});
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET = "synthetic-bypass";
  assert.deepEqual(deploymentHeaders(), {
    "x-vercel-protection-bypass": "synthetic-bypass",
  });
  assert.equal("authorization" in deploymentHeaders(), false);
});
