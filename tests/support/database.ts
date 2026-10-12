import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { exerciseName, exerciseSlugs } from "../fixtures/exercises";
import { assertTestEnvironment } from "./environment";

export async function withTestDatabase<T>(run: (pool: Pool) => Promise<T>) {
  assertTestEnvironment();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

export async function migrateTestDatabase() {
  await withTestDatabase(async (pool) => {
    await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
    for (const slug of exerciseSlugs) {
      // biome-ignore lint/performance/noAwaitInLoops: seed a small fixture catalog sequentially
      await pool.query(
        "INSERT INTO exercises (slug, display_name) VALUES ($1, $2)",
        [slug, exerciseName(slug)]
      );
    }
  });
}
