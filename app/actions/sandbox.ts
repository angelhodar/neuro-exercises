"use server";

import { getExerciseBySlug } from "@/app/actions/exercises";
import { getLastCompletedGeneration, updateExerciseGeneration } from "@/app/actions/generations";
import { Sandbox } from "@e2b/code-interpreter";
import { extractFiles } from "@/lib/zip";

// E2B Template ID - replace with your actual template ID
const TEMPLATE_ID = process.env.E2B_TEMPLATE_ID || "uwjrc97qg8qfno0643qu";

export type SandboxResult = 
  | {
      sandboxId: string;
      status: "running";
      sandboxUrl: string;
    }
  | {
      sandboxId: string;
      status: "paused";
    }
  | {
      sandboxId: string;
      status: null;
    };

async function getRunningExerciseSandbox(slug: string) {
  const sandboxes = await Sandbox.list();
  const existingSandbox = sandboxes.find(sb => sb.metadata?.slug === slug);
  return existingSandbox;
}

export async function createOrConnectToSandbox(slug: string): Promise<SandboxResult> {
  const existingSandbox = await getRunningExerciseSandbox(slug);

  if (existingSandbox) {
    const sandbox = await Sandbox.connect(existingSandbox.sandboxId);
    return {
      sandboxId: existingSandbox.sandboxId,
      status: "running",
      sandboxUrl: sandbox.getHost(3000)
    };
  }

  const lastGeneration = await getLastCompletedGeneration(slug);

  if (!lastGeneration || !lastGeneration.codeBlobKey) {
    throw new Error("No completed generation found with code blob key");
  }

  // Check if this generation already has a sandbox
  if (lastGeneration.sandboxId) {
    const sandbox = await Sandbox.connect(lastGeneration.sandboxId);
    return {
      sandboxId: lastGeneration.sandboxId,
      status: "running",
      sandboxUrl: sandbox.getHost(3000)
    };
  }

  const zipResponse = await fetch(lastGeneration.codeBlobKey);

  if (!zipResponse.ok) {
    throw new Error(`Failed to download code ZIP: ${zipResponse.statusText}`);
  }
  
  const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());
  
  // Extract files from the ZIP buffer
  const files = await extractFiles(zipBuffer);
  
  // Create E2B sandbox with environment variables
  const sandbox = await Sandbox.create(TEMPLATE_ID, {
    envs: {
      DATABASE_URL: process.env.DATABASE_URL!,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
      NEXT_PUBLIC_BLOB_URL: process.env.NEXT_PUBLIC_BLOB_URL!,
    },
    metadata: { slug }
  });

  // Get the host URL for the sandbox
  const host = sandbox.getHost(3000);
  
  // Write all files to the sandbox at /home/user
  const fileWrites = files.map(file => ({
    path: `/home/user/${file.path}`,
    data: file.content
  }));
  
  await sandbox.files.write(fileWrites);

  // Update the generation with the sandbox information
  await updateExerciseGeneration(lastGeneration.id, {
    sandboxId: sandbox.sandboxId,
  });

  return {
    sandboxId: sandbox.sandboxId,
    status: "running",
    sandboxUrl: host
  };
}

export async function stopSandbox(slug: string): Promise<void> {
  const existingSandbox = await getRunningExerciseSandbox(slug);

  if (!existingSandbox) throw new Error(`No sandbox found for the exercise ${slug}`);

  const sandbox = await Sandbox.connect(existingSandbox.sandboxId);
  await sandbox.kill();
} 