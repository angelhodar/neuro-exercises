import "dotenv/config";

import { createSnapshot } from "@/lib/sandbox";

async function main() {
  const [arg] = process.argv.slice(2);
  const sandboxName = arg ?? process.env.SANDBOX_NAME;
  const saved = await createSnapshot(sandboxName || undefined);
  console.log(`\nSnapshot ID: ${saved.snapshotId}`);
  console.log(`Expires at: ${saved.expiresAt?.toISOString() ?? "unknown"}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
