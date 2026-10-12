import assert from "node:assert/strict";
import { test } from "node:test";
import { appUrl, assertTestEnvironment } from "../support/environment";

const TEST_ENVIRONMENT_ERROR = /isolated local test environment/;
const validEnvironment: NodeJS.ProcessEnv = {
  BETTER_AUTH_URL: appUrl,
  DATABASE_URL: "postgresql://e2e:synthetic@127.0.0.1:5555/neurogranada_e2e",
  NEUROGRANADA_E2E: "1",
  NODE_ENV: "development",
  SANDBOX_NAMESPACE: "e2e-test",
};

test("test adapters accept only the disposable local development environment", (t) => {
  const previous = process.env;
  t.after(() => {
    process.env = previous;
  });
  process.env = { ...validEnvironment };
  assert.doesNotThrow(assertTestEnvironment);
  const overrides: Partial<NodeJS.ProcessEnv>[] = [
    { NEUROGRANADA_E2E: "0" },
    { NODE_ENV: "production" },
    {
      DATABASE_URL:
        "postgresql://e2e:synthetic@remote.example/neurogranada_e2e",
    },
    { DATABASE_URL: "postgresql://e2e:synthetic@127.0.0.1:5555/neurogranada" },
    {
      DATABASE_URL:
        "postgresql://operator:synthetic@127.0.0.1:5555/neurogranada_e2e",
    },
    { BETTER_AUTH_URL: "https://production.example" },
    { SANDBOX_NAMESPACE: "production" },
  ];
  for (const override of overrides) {
    process.env = { ...validEnvironment, ...override };
    assert.throws(assertTestEnvironment, TEST_ENVIRONMENT_ERROR);
  }
});
