import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { verifyPassword } from "better-auth/crypto";
import { bootstrapAdmin } from "../../lib/auth/bootstrap-admin";
import { getDatabaseDriver } from "../../lib/db/driver";

const INVALID_DRIVER = /DATABASE_DRIVER/;
const EXISTING_ADMIN = /already exists/;
const EXISTING_USER = /refusing/;

const input = {
  email: "admin@example.invalid",
  name: "Initial Admin",
  password: "Test-only-password-2026",
};

test("database transport selection supports PostgreSQL and preserves Neon", () => {
  assert.equal(
    getDatabaseDriver("postgresql://user:pass@localhost:5432/dev"),
    "postgres"
  );
  assert.equal(
    getDatabaseDriver("postgresql://user:pass@db.example.com/dev"),
    "postgres"
  );
  assert.equal(
    getDatabaseDriver("postgresql://user:pass@ep-example.neon.tech/dev"),
    "neon"
  );
  assert.equal(
    getDatabaseDriver(
      "postgresql://user:pass@ep-example.neon.tech/dev",
      "postgres"
    ),
    "postgres"
  );
  assert.throws(() => getDatabaseDriver("", "invalid"), INVALID_DRIVER);
});

test("bootstrap creates login credentials atomically and never overwrites accounts", async () => {
  const postgres = new PGlite();
  const client = {
    query: (text: string, values?: unknown[]) =>
      postgres.query<{ email: string; id: string; role: string | null }>(
        text,
        values
      ),
  };
  try {
    for (const file of [
      "0000_sudden_sunspot.sql",
      "0001_charming_aaron_stack.sql",
      "0002_romantic_frog_thor.sql",
      "0004_overrated_sebastian_shaw.sql",
      "0005_lazy_thunderbird.sql",
      "0006_many_red_shift.sql",
      "0007_boring_the_spike.sql",
      "0008_last_jackpot.sql",
      "0009_public_sage.sql",
    ]) {
      // biome-ignore lint/performance/noAwaitInLoops: migrations must run in order
      await postgres.exec(await readFile(`drizzle/${file}`, "utf8"));
    }
    await assert.rejects(
      bootstrapAdmin(client, { ...input, password: "short" })
    );
    const created = await bootstrapAdmin(client, input);
    assert.equal(created.created, true);
    const { rows } = await postgres.query<{
      password: string;
      provider_id: string;
      account_id: string;
    }>(
      "SELECT password, provider_id, account_id FROM accounts WHERE user_id = $1",
      [created.id]
    );
    assert.equal(rows[0].provider_id, "credential");
    assert.equal(rows[0].account_id, created.id);
    assert.notEqual(rows[0].password, input.password);
    assert.equal(
      await verifyPassword({
        hash: rows[0].password,
        password: input.password,
      }),
      true
    );
    assert.equal(
      (
        await bootstrapAdmin(client, {
          ...input,
          password: "Different-password-2026",
        })
      ).created,
      false
    );
    assert.deepEqual(
      (
        await postgres.query(
          "SELECT password FROM accounts WHERE user_id = $1",
          [created.id]
        )
      ).rows,
      [{ password: rows[0].password }]
    );
    await assert.rejects(
      bootstrapAdmin(client, { ...input, email: "other@example.invalid" }),
      EXISTING_ADMIN
    );
    await postgres.exec(
      "INSERT INTO users (id, email, name, role) VALUES ('regular', 'regular@example.invalid', 'Regular', 'user')"
    );
    await assert.rejects(
      bootstrapAdmin(client, { ...input, email: "regular@example.invalid" }),
      EXISTING_USER
    );
    await postgres.exec("DELETE FROM accounts; DELETE FROM users;");
    // Force a credential failure and verify that the user insert is rolled back.
    await postgres.exec(
      "ALTER TABLE accounts ADD CONSTRAINT reject_credentials CHECK (provider_id <> 'credential')"
    );
    await assert.rejects(bootstrapAdmin(client, input));
    assert.deepEqual((await postgres.query("SELECT id FROM users")).rows, []);
  } finally {
    await postgres.close();
  }
});
