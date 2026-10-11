const NAMESPACE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,22}[a-z0-9])?$/;
const PREVIEW_SUFFIX_PATTERN = /^[a-f0-9]{8}$/;

export function getSandboxNamespace(value = process.env.SANDBOX_NAMESPACE) {
  if (!(value && NAMESPACE_PATTERN.test(value))) {
    throw new Error(
      "SANDBOX_NAMESPACE is required: use 1–24 lowercase letters, digits or hyphens, starting and ending with a letter or digit"
    );
  }
  return value;
}

function exerciseIdentityId(id: number) {
  if (!(Number.isInteger(id) && id > 0 && id <= 2_147_483_647)) {
    throw new Error(
      "Sandbox identity requires a positive PostgreSQL integer ID"
    );
  }
  return id;
}

export function getWorkspaceIdentity(exerciseId: number) {
  const namespace = getSandboxNamespace();
  const id = exerciseIdentityId(exerciseId);
  return {
    harnessSessionId: `${namespace}-exercise-${id}`,
    namespace,
    sandboxName: `${namespace}-exercise-workspace-${id}`,
  };
}

export function assertWorkspaceIdentity(
  workspace: { harnessSessionId: string; sandboxName: string | null },
  exerciseId: number
) {
  const expected = getWorkspaceIdentity(exerciseId);
  if (
    workspace.harnessSessionId !== expected.harnessSessionId ||
    (workspace.sandboxName !== null &&
      workspace.sandboxName !== expected.sandboxName)
  ) {
    throw new Error(
      "Stored workspace belongs to a legacy or different Sandbox namespace. Stop generation traffic, verify DATABASE_URL and SANDBOX_NAMESPACE, then run npm run sandbox:reset-references -- --confirm"
    );
  }
  return expected;
}

function previewPrefix(generationId: number) {
  return `${getSandboxNamespace()}-exercise-preview-${exerciseIdentityId(generationId)}-`;
}

export function getPreviewSandboxName(generationId: number) {
  return `${previewPrefix(generationId)}${crypto.randomUUID().slice(0, 8)}`;
}

export function canReusePreviewSandbox(
  name: string | null,
  generationId: number
) {
  const prefix = previewPrefix(generationId);
  return Boolean(
    name?.startsWith(prefix) &&
      PREVIEW_SUFFIX_PATTERN.test(name.slice(prefix.length))
  );
}
