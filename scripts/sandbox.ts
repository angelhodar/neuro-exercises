import "dotenv/config";

import { createSnapshot } from "@/lib/sandbox";

async function main() {
  const [arg] = process.argv.slice(2);
  const sandboxId = arg ?? process.env.SANDBOX_ID;
  const saved = await createSnapshot(sandboxId || undefined);
  console.log(`\nSnapshot ID: ${saved.snapshotId}`);
  console.log(`Expires at: ${saved.expiresAt.toISOString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
