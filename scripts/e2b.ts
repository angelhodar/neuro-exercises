import "dotenv/config";
import { Sandbox } from "@e2b/code-interpreter";
import { createBlobUrl } from "@/lib/utils";
import { extractFiles } from "@/lib/zip";

const TEMPLATE_ID = "uwjrc97qg8qfno0643qu";
const blobKey =
  "generations/3a287f5e-12a4-4957-bae8-aa5d9385ade8-QIVXbfwwnSJCA0jCXYQYCgBia7I8ea.zip";
const exerciseId = 12;

async function getRunningExerciseSandbox(exerciseId: number) {
  const sandboxes = await Sandbox.list();
  const existingSandbox = sandboxes.find(
    (sb) => sb.metadata?.exerciseId === exerciseId.toString(),
  );
  return existingSandbox;
}

async function main() {
  const existingSandbox = await getRunningExerciseSandbox(exerciseId);

  let sandbox: Sandbox | null = null;

  if (existingSandbox) {
    sandbox = await Sandbox.connect(existingSandbox.sandboxId);
  } else {
    // Create E2B sandbox with environment variables
    sandbox = await Sandbox.create(TEMPLATE_ID, {
      envs: {
        DATABASE_URL: process.env.DATABASE_URL!,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
        NEXT_PUBLIC_BLOB_URL: process.env.NEXT_PUBLIC_BLOB_URL!,
      },
      metadata: { exerciseId: "12" },
    });
  }

  const zipResponse = await fetch(createBlobUrl(blobKey));

  if (!zipResponse.ok) {
    throw new Error(`Failed to download code ZIP: ${zipResponse.statusText}`);
  }

  const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());

  // Extract files from the ZIP buffer
  const files = await extractFiles(zipBuffer);

  // Get the host URL for the sandbox
  const host = sandbox.getHost(3000);

  // Write all files to the sandbox at /home/user
  const fileWrites = files.map((file) => ({
    path: `/home/user/${file.path}`,
    data: file.content,
  }));

  await sandbox.files.write(fileWrites);

  let result = await sandbox.commands.run("cd app/exercises && ls -l");
  console.log(result);

  result = await sandbox.commands.run("cd app/exercises && cat registry.tsx");

  console.log(result);
  
  console.log(host);
}

main();
