"use server";

import { Sandbox } from "@vercel/sandbox";
import {
  getGenerationById,
  getLastCompletedGeneration,
  updateExerciseGeneration,
} from "@/app/actions/generations";
import { getLatestSnapshot } from "@/app/actions/snapshots";
import type { Exercise } from "@/lib/db/schema";
import { createSnapshot } from "@/lib/sandbox";
import { createBlobUrl } from "@/lib/utils";
import { extractFiles } from "@/lib/zip";
import { getExerciseById } from "./exercises";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

// ─── Helpers ─────────────────────────────────────────────────────────

function createSandboxEnvVars(exercise: Exercise) {
  const vars: Record<string, string> = {
    NEXT_PUBLIC_BLOB_URL: process.env.NEXT_PUBLIC_BLOB_URL ?? "",
    SANDBOX_EXERCISE: JSON.stringify(exercise),
    NODE_ENV: "development",
    NEXT_TELEMETRY_DISABLED: "1",
  };

  return Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
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
      path: file.path,
      content: Buffer.from(file.content),
    }))
  );
}

async function waitForServer(sandbox: Sandbox, maxWaitMs = 60_000) {
  const url = sandbox.domain(3000);
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error(
    "No se pudo iniciar la previsualización del ejercicio. Intenta generar el código de nuevo."
  );
}

async function startDevServerAndWait(sandbox: Sandbox) {
  const command = await sandbox.runCommand({
    cmd: "npm",
    args: ["run", "dev"],
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

  if (
    snapshot &&
    new Date(snapshot.expiresAt).getTime() - Date.now() > TWO_DAYS_MS
  ) {
    return snapshot;
  }

  console.log(
    snapshot
      ? "Snapshot expiring soon. Creating fresh snapshot..."
      : "No valid snapshot found. Creating fresh snapshot..."
  );

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
  sandboxId: string,
  codeBlobKey: string,
  exercise: Exercise
) {
  const sandbox = await Sandbox.get({ sandboxId });

  if (sandbox.status !== "running") {
    return null;
  }

  // Refresh code files from blob (may have been updated by multiple writeFiles calls)
  await writeSandboxCodeFiles(sandbox, codeBlobKey);

  // Write .env (agent sandbox may not have it)
  await sandbox.writeFiles([
    {
      path: ".env",
      content: Buffer.from(createSandboxEnvVars(exercise)),
    },
  ]);

  // Start dev server if not already running (agent sandboxes don't start it)
  if (!(await isDevServerRunning(sandbox))) {
    await startDevServerAndWait(sandbox);
  }

  return {
    sandboxId: sandbox.sandboxId,
    sandboxUrl: sandbox.domain(3000),
  };
}

async function createNewSandbox(
  exercise: Exercise,
  codeBlobKey: string,
  snapshotId: string
) {
  const sandbox = await Sandbox.create({
    source: { type: "snapshot", snapshotId },
    ports: [3000],
    timeout: 900_000, // 15 min
  });

  await writeSandboxCodeFiles(sandbox, codeBlobKey);

  await sandbox.writeFiles([
    {
      path: ".env",
      content: Buffer.from(createSandboxEnvVars(exercise)),
    },
  ]);

  await startDevServerAndWait(sandbox);

  return {
    sandboxId: sandbox.sandboxId,
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

      if (result) {
        return result;
      }
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
    snapshot.snapshotId
  );

  // Store the sandbox ID on the generation for future reuse
  await updateExerciseGeneration(lastGeneration.id, {
    sandboxId: result.sandboxId,
  });

  return result;
}
