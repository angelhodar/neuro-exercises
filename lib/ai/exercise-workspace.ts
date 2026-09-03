import { Sandbox } from "@vercel/sandbox";
import { getLatestSnapshot } from "@/app/actions/snapshots";
import type { Exercise } from "@/lib/db/schema";
import { createSnapshot, SANDBOX_PROJECT_DIR } from "@/lib/sandbox";
import { createBlobUrl } from "@/lib/utils";
import { extractFiles } from "@/lib/zip";
import {
  getOrCreateExerciseWorkspace,
  updateExerciseWorkspace,
} from "./workspace-repository";

const DEV_SERVER_PORT = 3000;
const SANDBOX_TIMEOUT_MS = 30 * 60 * 1000;
const SNAPSHOT_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

function workspaceSandboxName(exerciseId: number) {
  return `exercise-workspace-${exerciseId}`;
}

function createSandboxEnv(exercise: Exercise) {
  const serializedExercise = JSON.stringify(exercise);
  return [
    `NEXT_PUBLIC_BLOB_URL=${process.env.NEXT_PUBLIC_BLOB_URL ?? ""}`,
    "NEXT_TELEMETRY_DISABLED=1",
    "NODE_ENV=development",
    `SANDBOX_EXERCISE=${serializedExercise}`,
    `SANDBOX_EXERCISE_BASE64=${Buffer.from(serializedExercise).toString("base64")}`,
  ].join("\n");
}

async function writeSandboxEnv(sandbox: Sandbox, exercise: Exercise) {
  await sandbox.writeFiles([
    {
      content: Buffer.from(createSandboxEnv(exercise)),
      path: `${SANDBOX_PROJECT_DIR}/.env`,
    },
  ]);
}

async function restoreCheckpoint(sandbox: Sandbox, codeBlobKey: string | null) {
  if (!codeBlobKey) {
    return;
  }

  const response = await fetch(createBlobUrl(codeBlobKey));
  if (!response.ok) {
    throw new Error(`No se pudo recuperar el código: ${response.statusText}`);
  }

  const files = extractFiles(Buffer.from(await response.arrayBuffer()));
  await sandbox.writeFiles(
    files.map((file) => ({
      content: Buffer.from(file.content),
      path: `${SANDBOX_PROJECT_DIR}/${file.path}`,
    }))
  );
}

async function isDevServerRunning(sandbox: Sandbox) {
  try {
    return (await fetch(sandbox.domain(DEV_SERVER_PORT))).ok;
  } catch {
    return false;
  }
}

async function waitForUrl(
  url: string,
  errorMessage: string,
  maxWaitMs = 60_000
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < maxWaitMs) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: readiness polling must be sequential
      if ((await fetch(url)).ok) {
        return;
      }
    } catch {
      // The dev server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(errorMessage);
}

async function ensureDevServer(sandbox: Sandbox) {
  if (await isDevServerRunning(sandbox)) {
    return;
  }

  await sandbox.runCommand({
    args: ["run", "dev"],
    cmd: "npm",
    cwd: SANDBOX_PROJECT_DIR,
    detached: true,
  });
  await waitForUrl(
    sandbox.domain(DEV_SERVER_PORT),
    "No se pudo iniciar la previsualización del ejercicio"
  );
}

async function getOrCreateBaseSnapshot() {
  const snapshot = await getLatestSnapshot();
  return snapshot ?? createSnapshot();
}

export async function getExerciseWorkspaceSandbox({
  checkpointBlobKey,
  exercise,
}: {
  checkpointBlobKey: string | null;
  exercise: Exercise;
}) {
  const workspace = await getOrCreateExerciseWorkspace(exercise.id);
  const snapshot = await getOrCreateBaseSnapshot();
  const name = workspace.sandboxName ?? workspaceSandboxName(exercise.id);

  const sandbox = await Sandbox.getOrCreate({
    keepLastSnapshots: { count: 1 },
    name,
    onCreate: async (createdSandbox) => {
      await restoreCheckpoint(createdSandbox, checkpointBlobKey);
    },
    persistent: true,
    resume: true,
    snapshotExpiration: SNAPSHOT_EXPIRATION_MS,
    source: { snapshotId: snapshot.snapshotId, type: "snapshot" },
    tags: { exerciseId: String(exercise.id), purpose: "exercise-workspace" },
    timeout: SANDBOX_TIMEOUT_MS,
  });

  await updateExerciseWorkspace(exercise.id, {
    baseCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    lastActiveAt: new Date(),
    lastError: null,
    sandboxName: sandbox.name,
  });

  return sandbox;
}

export async function getGenerationPreviewSandbox({
  checkpointBlobKey,
  exercise,
  generationId,
  sandboxName,
}: {
  checkpointBlobKey: string;
  exercise: Exercise;
  generationId: number;
  sandboxName: string | null;
}) {
  if (sandboxName) {
    try {
      const existingSandbox = await Sandbox.get({ name: sandboxName });
      await existingSandbox.extendTimeout(15 * 60 * 1000);
      await restoreCheckpoint(existingSandbox, checkpointBlobKey);
      await writeSandboxEnv(existingSandbox, exercise);
      await ensureDevServer(existingSandbox);
      await waitForUrl(
        `${existingSandbox.domain(DEV_SERVER_PORT)}/exercises/${exercise.slug}`,
        "La versión del ejercicio no se pudo compilar"
      );
      return existingSandbox;
    } catch (error) {
      console.error("Failed to reuse generation preview sandbox:", error);
    }
  }

  const snapshot = await getOrCreateBaseSnapshot();
  const sandbox = await Sandbox.create({
    name: `exercise-preview-${generationId}-${crypto.randomUUID().slice(0, 8)}`,
    persistent: false,
    ports: [DEV_SERVER_PORT],
    source: { snapshotId: snapshot.snapshotId, type: "snapshot" },
    tags: {
      exerciseId: String(exercise.id),
      generationId: String(generationId),
      purpose: "exercise-preview",
    },
    timeout: 15 * 60 * 1000,
  });

  await restoreCheckpoint(sandbox, checkpointBlobKey);
  await writeSandboxEnv(sandbox, exercise);
  await ensureDevServer(sandbox);
  await waitForUrl(
    `${sandbox.domain(DEV_SERVER_PORT)}/exercises/${exercise.slug}`,
    "La versión del ejercicio no se pudo compilar"
  );
  return sandbox;
}
