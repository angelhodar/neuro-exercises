"use server";

import { getLastCompletedGeneration } from "@/app/actions/generations";
import { Sandbox } from "@e2b/code-interpreter";
import { extractFiles } from "@/lib/zip";
import { createBlobUrl } from "@/lib/utils";
import { Exercise } from "@/lib/db/schema";
import { getExerciseById } from "./exercises";

// E2B Template ID - replace with your actual template ID
const TEMPLATE_ID = process.env.E2B_TEMPLATE_ID || "uwjrc97qg8qfno0643qu";

async function getRunningExerciseSandbox(exerciseId: number) {
  const paginator = Sandbox.list({ query: { metadata: { exerciseId: exerciseId.toString() } } });
  const sandboxes = await paginator.nextItems();
  return sandboxes[0];
}

function createSandboxEnvVars(exercise: Exercise) {
  const vars = {
    NEXT_PUBLIC_BLOB_URL: process.env.NEXT_PUBLIC_BLOB_URL!,
    SANDBOX_EXERCISE: JSON.stringify(exercise)
  };

  const stringifiedVars = Object.entries(vars).map(([key, value]) => `${key}=${value}`).join("\n");
  return stringifiedVars;
}

async function updateSandboxFiles(sandbox: Sandbox, codeBlobKey: string) {
  const zipResponse = await fetch(createBlobUrl(codeBlobKey));

  if (!zipResponse.ok) {
    throw new Error(`Failed to download code ZIP: ${zipResponse.statusText}`);
  }
  
  const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());
  
  // Extract files from the ZIP buffer
  const files = await extractFiles(zipBuffer);

  // Write all files to the sandbox at /home/user
  const fileWrites = files.map(file => ({
    path: `/home/user/${file.path}`,
    data: file.content
  }));

  await sandbox.files.write(fileWrites);
}

export async function createOrConnectToSandbox(exerciseId: number) {
  const existingSandbox = await getRunningExerciseSandbox(exerciseId);

  const lastGeneration = await getLastCompletedGeneration(exerciseId);

  if (!lastGeneration || !lastGeneration.codeBlobKey) {
    throw new Error("No completed generation found with code blob key");
  }

  if (existingSandbox) {
    const sandbox = await Sandbox.connect(existingSandbox.sandboxId);
    await sandbox.setTimeout(300_000);
    await updateSandboxFiles(sandbox, lastGeneration.codeBlobKey);
    return {
      sandboxId: existingSandbox.sandboxId,
      sandboxUrl: sandbox.getHost(3000)
    };
  }

  const exercise = await getExerciseById(exerciseId);

  if (!exercise) throw new Error(`Exercise ${exerciseId} not found`);
  
  // Create E2B sandbox with environment variables
  const sandbox = await Sandbox.create(TEMPLATE_ID, {
    metadata: { exerciseId: exerciseId.toString() },
  });

  await updateSandboxFiles(sandbox, lastGeneration.codeBlobKey);

  await sandbox.files.write([
    {
      path: "/home/user/.env",
      data: createSandboxEnvVars(exercise)
    }
  ]);

  // Get the host URL for the sandbox
  const host = sandbox.getHost(3000);

  return {
    sandboxId: sandbox.sandboxId, 
    sandboxUrl: host
  };
}

export async function stopSandbox(exerciseId: number) {
  const existingSandbox = await getRunningExerciseSandbox(exerciseId);

  if (!existingSandbox) throw new Error(`No sandbox found for the exercise ${exerciseId}`);

  const sandbox = await Sandbox.connect(existingSandbox.sandboxId);
  await sandbox.kill();

  return sandbox.sandboxId;
} 