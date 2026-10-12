import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, mock, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { verifyPassword } from "better-auth/crypto";
import { drizzle } from "drizzle-orm/pglite";
import { DELETE } from "../../app/api/e2e/cleanup/route";
import { POST } from "../../app/api/e2e/setup/route";
import { authorizeE2E } from "../../lib/e2e/access";
import { e2eIdentities, smokeExerciseSlugs } from "../../lib/e2e/fixtures";

const token = "isolated-e2e-endpoint-token-at-least-32-characters";
const namespace = "preview-endpoint-tests";
const postgres = new PGlite();
const database = drizzle(postgres);

function request(runId: string, body: unknown = { runId }) {
  return new Request("http://localhost:3000/api/e2e/setup", {
    body: JSON.stringify(body),
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    method: "POST",
  });
}

before(async () => {
  process.env.DATABASE_URL = "postgresql://audit:audit@localhost:5432/audit";
  process.env.E2E_TOKEN = token;
  process.env.SANDBOX_NAMESPACE = namespace;
  process.env.VERCEL_ENV = "preview";
  const files = (await readdir("drizzle"))
    .filter((file) => file.endsWith(".sql") && !file.startsWith("0003_"))
    .sort();
  for (const file of files) {
    // biome-ignore lint/performance/noAwaitInLoops: apply migrations in order to isolated PostgreSQL
    await postgres.exec(await readFile(`drizzle/${file}`, "utf8"));
  }
  for (const slug of smokeExerciseSlugs) {
    // biome-ignore lint/performance/noAwaitInLoops: seed a fixed catalog sequentially
    await postgres.query(
      "INSERT INTO exercises (slug, display_name) VALUES ($1, $1)",
      [slug]
    );
  }
  const { db } = await import("../../lib/db");
  mock.method(
    db,
    "execute",
    database.execute.bind(database) as unknown as typeof db.execute
  );
  mock.method(
    db,
    "select",
    database.select.bind(database) as unknown as typeof db.select
  );
});

after(async () => {
  mock.restoreAll();
  await postgres.close();
});

test("fixture endpoints are disabled by default and in production, including with a valid token", () => {
  const previous = process.env;
  try {
    for (const override of [
      { VERCEL_ENV: "production" },
      { VERCEL_ENV: "development" },
      { E2E_TOKEN: "" },
      { E2E_TOKEN: "short" },
      { SANDBOX_NAMESPACE: "production" },
      { DATABASE_URL: "not a URL" },
    ]) {
      process.env = { ...previous, ...override };
      const denied = authorizeE2E(request(randomUUID()));
      assert.ok(denied instanceof Response);
      assert.equal(denied.status, 404);
    }
    process.env = { ...previous, NODE_ENV: "production" };
    assert.ok(
      !(authorizeE2E(request(randomUUID())) instanceof Response),
      "a deployed preview uses production-mode Next.js"
    );
    process.env = {
      ...previous,
      NEUROGRANADA_E2E: "1",
      VERCEL_ENV: "production",
    };
    assert.ok(authorizeE2E(request(randomUUID())) instanceof Response);
  } finally {
    process.env = previous;
  }
});

test("authentication and strict run validation happen before fixture writes", async () => {
  const anonymous = new Request("http://localhost:3000/api/e2e/setup", {
    method: "POST",
  });
  assert.equal((await POST(anonymous)).status, 401);
  assert.equal(
    (await DELETE(new Request(anonymous.url, { method: "DELETE" }))).status,
    401
  );
  const wrong = request(randomUUID());
  wrong.headers.set("authorization", "Bearer wrong-token");
  assert.equal((await POST(wrong)).status, 401);
  const runId = randomUUID();
  assert.equal(
    (await POST(request(runId, { role: "admin", runId }))).status,
    400
  );
  assert.equal(
    (await DELETE(request(runId, { runId, userId: "human" }))).status,
    400
  );
  assert.equal((await DELETE(request(runId, { all: true }))).status, 400);
  assert.equal((await POST(request("invalid"))).status, 400);
  assert.equal((await postgres.query("SELECT id FROM users")).rows.length, 0);
});

test("setup creates login credentials for two ordinary synthetic users and retries never overwrite them", async () => {
  const runId = randomUUID();
  const identities = e2eIdentities(runId, namespace, token);
  const response = await POST(request(runId));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.deepEqual(body.professional, identities.professional);
  assert.deepEqual(body.stranger, identities.stranger);
  assert.equal(body.exercises.length, smokeExerciseSlugs.length);
  const credentials = await postgres.query<{ password: string; role: string }>(
    "SELECT a.password, u.role FROM accounts a JOIN users u ON u.id = a.user_id WHERE u.id = $1",
    [identities.professional.id]
  );
  assert.equal(credentials.rows[0].role, "user");
  assert.equal(
    await verifyPassword({
      hash: credentials.rows[0].password,
      password: identities.professional.password,
    }),
    true
  );
  assert.equal((await POST(request(runId))).status, 200);
  const retried = await postgres.query<{ password: string }>(
    "SELECT password FROM accounts WHERE user_id = $1",
    [identities.professional.id]
  );
  assert.equal(retried.rows[0].password, credentials.rows[0].password);
  await DELETE(request(runId));
});

test("changed or promoted synthetic accounts are never overwritten or deleted", async () => {
  const runId = randomUUID();
  assert.equal((await POST(request(runId))).status, 200);
  const { id } = e2eIdentities(runId, namespace, token).professional;
  await postgres.query("UPDATE users SET role = 'admin' WHERE id = $1", [id]);
  try {
    assert.equal((await POST(request(runId))).status, 409);
    assert.equal((await DELETE(request(runId))).status, 200);
    const preserved = await postgres.query<{ role: string }>(
      "SELECT role FROM users WHERE id = $1",
      [id]
    );
    assert.equal(preserved.rows[0].role, "admin");
  } finally {
    await postgres.query("UPDATE users SET role = 'user' WHERE id = $1", [id]);
    await DELETE(request(runId));
  }
});

test("account insertion failures do not leave partially provisioned users", async () => {
  const runId = randomUUID();
  const { professional, stranger } = e2eIdentities(runId, namespace, token);
  await postgres.exec(
    "CREATE FUNCTION refuse_fixture_account() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END $$; CREATE TRIGGER refuse_fixture_account BEFORE INSERT ON accounts FOR EACH ROW EXECUTE FUNCTION refuse_fixture_account();"
  );
  try {
    assert.equal((await POST(request(runId))).status, 409);
    assert.equal(
      (
        await postgres.query("SELECT id FROM users WHERE id IN ($1, $2)", [
          professional.id,
          stranger.id,
        ])
      ).rows.length,
      0
    );
  } finally {
    await postgres.exec(
      "DROP TRIGGER refuse_fixture_account ON accounts; DROP FUNCTION refuse_fixture_account();"
    );
  }
});

test("cleanup removes only the selected run's owned records and is idempotent", async () => {
  const first = randomUUID();
  const second = randomUUID();
  await POST(request(first));
  await POST(request(second));
  const firstUser = e2eIdentities(first, namespace, token).professional;
  const secondUser = e2eIdentities(second, namespace, token).professional;
  await postgres.exec(
    "INSERT INTO users (id, email, name, role) VALUES ('human', 'e2e-human@example.invalid', 'Human', 'user')"
  );
  await postgres.query(
    "INSERT INTO patients (creator_id, first_name, last_name) VALUES ($1, 'Synthetic', 'First'), ($2, 'Synthetic', 'Second'), ('human', 'Human', 'Patient')",
    [firstUser.id, secondUser.id]
  );
  await postgres.query(
    "INSERT INTO exercise_templates (creator_id, title) VALUES ($1, 'Synthetic template')",
    [firstUser.id]
  );
  await postgres.query(
    "INSERT INTO exercise_config_presets (creator_id, exercise_id, name, config) SELECT $1, id, 'Synthetic preset', '{}' FROM exercises LIMIT 1",
    [firstUser.id]
  );
  await postgres.query(
    "INSERT INTO exercises (slug, display_name, creator_id) VALUES ($1, 'Synthetic generated exercise', $2)",
    [`generated-${first}`, firstUser.id]
  );
  await postgres.query(
    "INSERT INTO sessions (id, token, expires_at, user_id) VALUES ('fixture-session', 'fixture-session-token', now() + interval '1 day', $1)",
    [firstUser.id]
  );
  assert.equal((await DELETE(request(randomUUID()))).status, 200);
  assert.equal(
    (await postgres.query("SELECT id FROM patients")).rows.length,
    3
  );
  assert.equal((await DELETE(request(first))).status, 200);
  const remaining = await postgres.query<{ creator_id: string }>(
    "SELECT creator_id FROM patients ORDER BY creator_id"
  );
  assert.deepEqual(
    remaining.rows.map((row) => row.creator_id).sort(),
    ["human", secondUser.id].sort()
  );
  assert.equal(
    (await postgres.query("SELECT id FROM sessions")).rows.length,
    0
  );
  assert.equal(
    (await postgres.query("SELECT id FROM exercise_templates")).rows.length,
    0
  );
  assert.equal(
    (await postgres.query("SELECT id FROM exercise_config_presets")).rows
      .length,
    0
  );
  assert.equal(
    (await postgres.query("SELECT id FROM exercises")).rows.length,
    smokeExerciseSlugs.length
  );
  assert.equal((await DELETE(request(first))).status, 200);
  await DELETE(request(second));
});

test("a different namespace cannot clean copied test identities", async () => {
  const runId = randomUUID();
  await POST(request(runId));
  const { id } = e2eIdentities(runId, namespace, token).professional;
  process.env.SANDBOX_NAMESPACE = "preview-other";
  try {
    assert.equal((await DELETE(request(runId))).status, 200);
    assert.equal(
      (await postgres.query("SELECT id FROM users WHERE id = $1", [id])).rows
        .length,
      1
    );
  } finally {
    process.env.SANDBOX_NAMESPACE = namespace;
    await DELETE(request(runId));
  }
});

test("cleanup rolls back exercise deletion when deleting an account fails", async () => {
  const runId = randomUUID();
  await POST(request(runId));
  const { id } = e2eIdentities(runId, namespace, token).professional;
  const slug = `rollback-${runId}`;
  await postgres.query(
    "INSERT INTO exercises (slug, display_name, creator_id) VALUES ($1, 'Rollback fixture', $2)",
    [slug, id]
  );
  await postgres.exec(
    "CREATE FUNCTION refuse_fixture_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END $$; CREATE TRIGGER refuse_fixture_delete BEFORE DELETE ON users FOR EACH ROW EXECUTE FUNCTION refuse_fixture_delete();"
  );
  try {
    assert.equal((await DELETE(request(runId))).status, 500);
    assert.equal(
      (await postgres.query("SELECT id FROM exercises WHERE slug = $1", [slug]))
        .rows.length,
      1
    );
    assert.equal(
      (await postgres.query("SELECT id FROM users WHERE id = $1", [id])).rows
        .length,
      1
    );
  } finally {
    await postgres.exec(
      "DROP TRIGGER refuse_fixture_delete ON users; DROP FUNCTION refuse_fixture_delete();"
    );
    await DELETE(request(runId));
  }
});
