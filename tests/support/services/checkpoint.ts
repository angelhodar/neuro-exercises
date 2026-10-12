import { assertTestEnvironment } from "../environment";

export function createExerciseCheckpoint(_sandbox: unknown, slug: string) {
  assertTestEnvironment();
  return Promise.resolve(`e2e-checkpoints/${slug}/${crypto.randomUUID()}.zip`);
}
