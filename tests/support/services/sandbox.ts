import {
  getOrCreateExerciseWorkspace,
  updateExerciseWorkspace,
} from "../../../lib/ai/workspace-repository";
import type { Exercise } from "../../../lib/db/schema";
import {
  assertWorkspaceIdentity,
  getPreviewSandboxName,
} from "../../../lib/sandbox-identity";
import { assertTestEnvironment, previewUrl } from "../environment";

export async function getExerciseWorkspaceSandbox({
  exercise,
}: {
  exercise: Exercise;
}) {
  assertTestEnvironment();
  const workspace = await getOrCreateExerciseWorkspace(exercise.id);
  const identity = assertWorkspaceIdentity(workspace, exercise.id);
  await updateExerciseWorkspace(exercise.id, {
    sandboxName: identity.sandboxName,
  });
  return { name: identity.sandboxName };
}

export function getGenerationPreviewSandbox({
  generationId,
}: {
  generationId: number;
}) {
  assertTestEnvironment();
  return Promise.resolve({
    domain: () => previewUrl,
    name: getPreviewSandboxName(generationId),
  });
}
