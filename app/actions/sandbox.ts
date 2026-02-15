"use server";

import { Sandbox } from "@vercel/sandbox";
import { getLastCompletedGeneration } from "@/app/actions/generations";
import { getLatestSnapshot } from "@/app/actions/snapshots";
import type { Exercise } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";
import { extractFiles } from "@/lib/zip";
import { getExerciseById } from "./exercises";

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

async function updateSandboxFiles(sandbox: Sandbox, codeBlobKey: string) {
  const zipResponse = await fetch(createBlobUrl(codeBlobKey));

  if (!zipResponse.ok) {
    throw new Error(`Failed to download code ZIP: ${zipResponse.statusText}`);
  }

  const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());
  const files = await extractFiles(zipBuffer);

  // Write files relative to the sandbox working directory
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

  throw new Error("Dev server did not start in time");
}

export async function createOrConnectToSandbox(exerciseId: number) {
  const lastGeneration = await getLastCompletedGeneration(exerciseId);

  if (!lastGeneration?.codeBlobKey) {
    throw new Error("No completed generation found with code blob key");
  }

  const snapshot = await getLatestSnapshot();

  if (!snapshot) {
    throw new Error(
      "No valid sandbox snapshot found. Run: npm run sandbox snapshot"
    );
  }

  const exercise = await getExerciseById(exerciseId);

  if (!exercise) {
    throw new Error(`Exercise ${exerciseId} not found`);
  }

  // Create sandbox from snapshot
  const sandbox = await Sandbox.create({
    source: { type: "snapshot", snapshotId: snapshot.snapshotId },
    ports: [3000],
    timeout: 300_000, // 5 min
  });

  // Write exercise files from blob
  await updateSandboxFiles(sandbox, lastGeneration.codeBlobKey);

  // Write .env with exercise data
  await sandbox.writeFiles([
    {
      path: ".env",
      content: Buffer.from(createSandboxEnvVars(exercise)),
    },
  ]);

  // Start dev server (detached so it doesn't block)
  await sandbox.runCommand({
    cmd: "npm",
    args: ["run", "dev"],
    detached: true,
  });

  // Wait for the dev server to be ready
  await waitForServer(sandbox);

  const sandboxUrl = sandbox.domain(3000);

  return {
    sandboxId: sandbox.sandboxId,
    sandboxUrl,
  };
}
