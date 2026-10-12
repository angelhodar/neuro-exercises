import "../lib/load-env";

import { Pool } from "pg";
import { resetSandboxReferences } from "../lib/reset-sandbox-references";
import { getSandboxNamespace } from "../lib/sandbox-identity";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  const target = new URL(process.env.DATABASE_URL);
  const namespace = getSandboxNamespace();
  console.log(
    `Reset target: ${target.hostname}:${target.port || "5432"}${target.pathname}; namespace: ${namespace}`
  );
  if (!process.argv.includes("--confirm")) {
    throw new Error(
      "Stop generation traffic and verify the target, then rerun with --confirm. This clears all workspace resume state and preview references in this database"
    );
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const client = await pool.connect();
    try {
      const result = await resetSandboxReferences(client);
      console.log(
        `Reset ${result.workspaces} workspaces and ${result.previews} preview references. Checkpoint ZIPs and remote sandboxes were not deleted`
      );
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Sandbox reset failed"
  );
  process.exitCode = 1;
});
