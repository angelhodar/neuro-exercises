import "../lib/load-env";

import { Pool } from "pg";
import {
  bootstrapAdmin,
  bootstrapAdminSchema,
} from "../lib/auth/bootstrap-admin";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  const target = new URL(process.env.DATABASE_URL);
  console.log(
    `Bootstrap target: ${target.hostname}:${target.port || "5432"}${target.pathname}`
  );
  if (!process.argv.includes("--confirm")) {
    throw new Error(
      "Verify DATABASE_URL, then rerun with --confirm to provision the first admin"
    );
  }
  const input = bootstrapAdminSchema.safeParse({
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    name: process.env.BOOTSTRAP_ADMIN_NAME,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
  });
  if (!input.success) {
    throw new Error(
      "Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, and BOOTSTRAP_ADMIN_PASSWORD (12–128 characters)"
    );
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const client = await pool.connect();
    try {
      const result = await bootstrapAdmin(client, input.data);
      console.log(
        result.created
          ? "Initial administrator created"
          : "Administrator already exists; no changes made"
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
    error instanceof Error ? error.message : "Admin bootstrap failed"
  );
  process.exitCode = 1;
});
