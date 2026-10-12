import "../load-env";

import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as postgresDrizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import { getDatabaseDriver } from "./driver";
// biome-ignore lint/performance/noNamespaceImport: drizzle requires namespace import for schema
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "";
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}
const driver = getDatabaseDriver(connectionString, process.env.DATABASE_DRIVER);

const globalDatabase = globalThis as typeof globalThis & {
  postgresPool?: Pool;
};

function getPostgresPool() {
  const pool = globalDatabase.postgresPool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") {
    globalDatabase.postgresPool = pool;
  }
  return pool;
}

export const db: PgDatabase<PgQueryResultHKT, typeof schema> =
  driver === "neon"
    ? neonDrizzle(connectionString, { schema })
    : postgresDrizzle(getPostgresPool(), { schema });
