import "dotenv/config";
import { Sandbox } from "@e2b/code-interpreter";
import { createBlobUrl } from "@/lib/utils";
import { extractFiles } from "@/lib/zip";
import { getExerciseById } from "@/app/actions/exercises";

const TEMPLATE_ID = "uwjrc97qg8qfno0643qu";
const blobKey =
  "generations/3a287f5e-12a4-4957-bae8-aa5d9385ade8-QIVXbfwwnSJCA0jCXYQYCgBia7I8ea.zip";
const exerciseId = 5;

async function getRunningExerciseSandbox(exerciseId: number) {
  const paginator = Sandbox.list({ query: { metadata: { exerciseId: exerciseId.toString() } } });
  const sandboxes = await paginator.nextItems();
  return sandboxes[0];
}

async function main() {
  const existingSandbox = await getRunningExerciseSandbox(exerciseId);

  let sandbox: Sandbox | null = null;

  if (existingSandbox) {
    sandbox = await Sandbox.connect(existingSandbox.sandboxId);
  } else {
    sandbox = await Sandbox.create(TEMPLATE_ID, {
      metadata: { exerciseId: exerciseId.toString() },
      timeoutMs: 300_000
    });
  }

  const exercise = await getExerciseById(exerciseId);

  /*const zipResponse = await fetch(createBlobUrl(blobKey));

  if (!zipResponse.ok) {
    throw new Error(`Failed to download code ZIP: ${zipResponse.statusText}`);
  }

  const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());

  // Extract files from the ZIP buffer
  const files = await extractFiles(zipBuffer);
  
  // Write all files to the sandbox at /home/user
  const fileWrites = files.map((file) => ({
    path: `/home/user/${file.path}`,
    data: file.content,
  }));

  await sandbox.files.write(fileWrites);*/

  const env = `NEXT_PUBLIC_BLOB_URL=${process.env.NEXT_PUBLIC_BLOB_URL!}\nSANDBOX_EXERCISE=${JSON.stringify(exercise)}`;

  await sandbox.files.write([
    {
      path: "/home/user/.env",
      data: env,
    },
  ]);

  //const result = await sandbox.commands.run("cd /home/user && ls");

  //console.log(result)
  const host = sandbox.getHost(3000);
  console.log(host);

  //await new Promise((resolve) => setTimeout(resolve, 500000));
}

main();
