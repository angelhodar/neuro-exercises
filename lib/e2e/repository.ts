import { hashPassword } from "better-auth/crypto";
import { inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { exercises, users } from "../db/schema";
import { e2eIdentities, smokeExerciseSlugs } from "./fixtures";

export async function setupE2ERun(
  runId: string,
  namespace: string,
  token: string
) {
  const identities = e2eIdentities(runId, namespace, token);
  const { professional, stranger } = identities;
  const catalog = await db
    .select({ displayName: exercises.displayName, slug: exercises.slug })
    .from(exercises)
    .where(inArray(exercises.slug, [...smokeExerciseSlugs]));
  if (catalog.length !== smokeExerciseSlugs.length) {
    throw new Error(
      "Register the built-in smoke exercises in the preview catalog before testing"
    );
  }
  const [professionalHash, strangerHash] = await Promise.all([
    hashPassword(professional.password),
    hashPassword(stranger.password),
  ]);
  // One atomic statement works with both PostgreSQL and Neon HTTP. Retries do
  // not overwrite existing accounts or reset their passwords/permissions.
  await db.execute(sql`
    WITH inserted AS (
      INSERT INTO users (id, email, name, role) VALUES
        (${professional.id}, ${professional.email}, ${professional.name}, 'user'),
        (${stranger.id}, ${stranger.email}, ${stranger.name}, 'user')
      ON CONFLICT (id) DO NOTHING RETURNING id
    )
    INSERT INTO accounts (id, account_id, provider_id, user_id, password)
      SELECT id, id, 'credential', id,
        CASE WHEN id = ${professional.id} THEN ${professionalHash} ELSE ${strangerHash} END
      FROM inserted
  `);
  const stored = await db
    .select()
    .from(users)
    .where(inArray(users.id, [professional.id, stranger.id]));
  if (
    stored.length !== 2 ||
    stored.some((user) => {
      const expected = user.id === professional.id ? professional : stranger;
      return (
        user.email !== expected.email ||
        user.name !== expected.name ||
        user.role !== "user"
      );
    })
  ) {
    throw new Error(
      "Synthetic account identity changed; refusing to overwrite it"
    );
  }
  return { ...identities, exercises: catalog, runId };
}

export async function cleanupE2ERun(
  runId: string,
  namespace: string,
  token: string
) {
  const { professional, stranger } = e2eIdentities(runId, namespace, token);
  // Never accept arbitrary IDs, email prefixes, or table names from a caller.
  // Remove owned exercise metadata before users (its creator FK is SET NULL);
  // the remaining smoke records are removed by their ownership cascades.
  await db.execute(sql`
    WITH owned AS MATERIALIZED (
      SELECT id FROM users WHERE role = 'user' AND (
        (id = ${professional.id} AND email = ${professional.email} AND name = ${professional.name}) OR
        (id = ${stranger.id} AND email = ${stranger.email} AND name = ${stranger.name})
      ) FOR UPDATE
    ), removed_exercises AS (
      DELETE FROM exercises WHERE creator_id IN (SELECT id FROM owned) RETURNING id
    )
    DELETE FROM users WHERE id IN (SELECT id FROM owned)
      AND (SELECT count(*) FROM removed_exercises) >= 0
  `);
}
