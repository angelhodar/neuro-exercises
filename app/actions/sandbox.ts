"use server";

import { Sandbox } from "@vercel/sandbox";
import {
  getGenerationById,
  getLastCompletedGeneration,
  updateExerciseGeneration,
} from "@/app/actions/generations";
import { getLatestSnapshot } from "@/app/actions/snapshots";
import type { Exercise } from "@/lib/db/schema";
import { createSnapshot, SANDBOX_PROJECT_DIR } from "@/lib/sandbox";
import { createBlobUrl } from "@/lib/utils";
import { extractFiles } from "@/lib/zip";
import { getExerciseById } from "./exercises";

// ─── Helpers ─────────────────────────────────────────────────────────

function createSandboxEnvVars(exercise: Exercise) {
  const vars: Record<string, string> = {
    NEXT_PUBLIC_BLOB_URL: process.env.NEXT_PUBLIC_BLOB_URL ?? "",
    NEXT_TELEMETRY_DISABLED: "1",
    NODE_ENV: "development",
    SANDBOX_EXERCISE: JSON.stringify(exercise),
  };

  return Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function previewSandboxName(generationId: number) {
  return `exercise-preview-${generationId}`;
}

async function writeSandboxCodeFiles(sandbox: Sandbox, codeBlobKey: string) {
  const zipResponse = await fetch(createBlobUrl(codeBlobKey));

  if (!zipResponse.ok) {
    throw new Error(`Failed to download code ZIP: ${zipResponse.statusText}`);
  }

  const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());
  const files = await extractFiles(zipBuffer);

  await sandbox.writeFiles(
    files.map((file) => ({
      content: Buffer.from(file.content),
      path: `${SANDBOX_PROJECT_DIR}/${file.path}`,
    }))
  );
}

function waitForServer(sandbox: Sandbox, maxWaitMs = 60_000) {
  const url = sandbox.domain(3000);
  const start = Date.now();

  const checkServer = async (): Promise<boolean> => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    return false;
  };

  const poll = async (): Promise<void> => {
    if (Date.now() - start >= maxWaitMs) {
      throw new Error(
        "No se pudo iniciar la previsualización del ejercicio. Intenta generar el código de nuevo."
      );
    }
    if (await checkServer()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return poll();
  };

  return poll();
}

async function startDevServerAndWait(sandbox: Sandbox) {
  const command = await sandbox.runCommand({
    args: ["run", "dev"],
    cmd: "npm",
    cwd: SANDBOX_PROJECT_DIR,
    detached: true,
  });

  // Collect stderr in the background for debugging if the server fails
  const stderrLines: string[] = [];
  const abortController = new AbortController();

  const logCollector = (async () => {
    try {
      for await (const log of command.logs({
        signal: abortController.signal,
      })) {
        if (log.stream === "stderr") {
          stderrLines.push(log.data);
        }
      }
    } catch {
      // AbortError or stream closed — expected
    }
  })();

  try {
    await waitForServer(sandbox);
  } catch (error) {
    if (stderrLines.length > 0) {
      console.error(
        "Dev server stderr output:\n",
        stderrLines.join("").slice(0, 5000)
      );
    }
    throw error;
  } finally {
    abortController.abort();
    await logCollector;
  }
}

// ─── Snapshot ────────────────────────────────────────────────────────

async function getOrRefreshSnapshot() {
  const snapshot = await getLatestSnapshot();

  if (snapshot) {
    return snapshot;
  }

  console.log("No valid snapshot found. Creating fresh snapshot...");
  return createSnapshot();
}

// ─── Sandbox Lifecycle ───────────────────────────────────────────────

async function isDevServerRunning(sandbox: Sandbox) {
  try {
    const res = await fetch(sandbox.domain(3000));
    return res.ok;
  } catch {
    return false;
  }
}

async function tryReuseSandbox(
  sandboxName: string,
  codeBlobKey: string,
  exercise: Exercise
) {
  const sandbox = await Sandbox.get({ name: sandboxName });

  try {
    await sandbox.extendTimeout(900_000);
  } catch (error) {
    console.error("Failed to extend sandbox timeout:", error);
  }

  // Refresh code files from blob (may have been updated by multiple writeFiles calls)
  await writeSandboxCodeFiles(sandbox, codeBlobKey);

  // Write .env (agent sandbox may not have it)
  await sandbox.writeFiles([
    {
      content: Buffer.from(createSandboxEnvVars(exercise)),
      path: `${SANDBOX_PROJECT_DIR}/.env`,
    },
  ]);

  // Start dev server if not already running (agent sandboxes don't start it)
  if (!(await isDevServerRunning(sandbox))) {
    await startDevServerAndWait(sandbox);
  }

  return {
    sandboxName: sandbox.name,
    sandboxUrl: sandbox.domain(3000),
  };
}

async function createNewSandbox(
  exercise: Exercise,
  codeBlobKey: string,
  snapshotId: string,
  generationId: number
) {
  const sandbox = await Sandbox.create({
    name: previewSandboxName(generationId),
    ports: [3000],
    source: { snapshotId, type: "snapshot" },
    timeout: 900_000, // 15 min
  });

  await writeSandboxCodeFiles(sandbox, codeBlobKey);

  await sandbox.writeFiles([
    {
      content: Buffer.from(createSandboxEnvVars(exercise)),
      path: `${SANDBOX_PROJECT_DIR}/.env`,
    },
  ]);

  await startDevServerAndWait(sandbox);

  return {
    sandboxName: sandbox.name,
    sandboxUrl: sandbox.domain(3000),
  };
}

// ─── Public API ──────────────────────────────────────────────────────

export async function initializeExercisePreview(
  exerciseId: number,
  generationId?: number | null
) {
  const lastGeneration = generationId
    ? await getGenerationById(generationId)
    : await getLastCompletedGeneration(exerciseId);

  if (!lastGeneration?.codeBlobKey) {
    throw new Error("No completed generation found with code blob key");
  }
  console.log("Called");

  const exercise = await getExerciseById(exerciseId);

  if (!exercise) {
    throw new Error(`Exercise ${exerciseId} not found`);
  }

  // Fast path: try to reuse the sandbox from the last generation
  if (lastGeneration.sandboxId) {
    try {
      const result = await tryReuseSandbox(
        lastGeneration.sandboxId,
        lastGeneration.codeBlobKey,
        exercise
      );

      return result;
    } catch {
      // Sandbox is gone or errored — fall through to create a new one
    }

    // Clear stale sandbox reference
    await updateExerciseGeneration(lastGeneration.id, { sandboxId: null });
  }

  // Full path: create a new sandbox from a fresh snapshot
  const snapshot = await getOrRefreshSnapshot();

  const result = await createNewSandbox(
    exercise,
    lastGeneration.codeBlobKey,
    snapshot.snapshotId,
    lastGeneration.id
  );

  // The legacy sandbox_id column now stores the v2/v3 sandbox name.
  await updateExerciseGeneration(lastGeneration.id, {
    sandboxId: result.sandboxName,
  });

  return result;
}
