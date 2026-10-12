import { assertTestEnvironment } from "../environment";

export function createVercelSandbox() {
  assertTestEnvironment();
  return { createSession: () => Promise.resolve({ fixture: true }) };
}
