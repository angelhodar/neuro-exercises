import "dotenv/config";
import { Sandbox } from "@e2b/code-interpreter";

const TEMPLATE_ID = "uwjrc97qg8qfno0643qu";

async function main() {
  const runningSandboxes = await Sandbox.list() 

  for (const sandbox of runningSandboxes) {
    console.log(sandbox.sandboxId);
  }

  const sandbox = await Sandbox.create(TEMPLATE_ID, {
    envs: {
      DATABASE_URL: process.env.DATABASE_URL!,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN!,
      NEXT_PUBLIC_BLOB_URL: process.env.NEXT_PUBLIC_BLOB_URL!,
    },
  });

  const host = sandbox.getHost(3000);

  console.log(host);
}

main();
