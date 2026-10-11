import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, mock, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { Sandbox, Snapshot } from "@vercel/sandbox";
import { drizzle } from "drizzle-orm/pglite";
// biome-ignore lint/performance/noNamespaceImport: Drizzle requires relations
import * as schema from "../lib/db/schema";
import { resetSandboxReferences } from "../lib/reset-sandbox-references";
import {
  assertWorkspaceIdentity,
  canReusePreviewSandbox,
  getPreviewSandboxName,
  getSandboxNamespace,
  getWorkspaceIdentity,
} from "../lib/sandbox-identity";
import { createZipBuffer } from "../lib/zip";

const INVALID_NAMESPACE = /SANDBOX_NAMESPACE/;
const WRONG_WORKSPACE = /legacy or different/;
const ACTIVE_LOCK = /Active generation/;
const FOREIGN_SANDBOX = /different namespace/;
const postgres = new PGlite();
const database = drizzle(postgres, { schema });
const client = {
  query: (text: string, values?: unknown[]) =>
    postgres.query<{ id: number }>(text, values),
};
const originalNamespace = process.env.SANDBOX_NAMESPACE;
const calls: { method: string; name: string; tags?: Record<string, string> }[] =
  [];
let repository: typeof import("../lib/ai/workspace-repository");
let sandboxes: typeof import("../lib/ai/exercise-workspace");

function fakeSandbox(name: string) {
  return {
    domain: () => "https://preview.example.invalid",
    extendTimeout: async () => undefined,
    name,
    runCommand: async () => ({ exitCode: 0 }),
    writeFiles: async () => undefined,
  };
}

before(async () => {
  // No configured database or Sandbox/Gateway credentials are used by this suite.
  process.env.DATABASE_URL = "postgresql://audit:audit@localhost:5432/audit";
  process.env.SANDBOX_NAMESPACE = "local-test";
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
    "0010_exercise_requirement_drafts.sql",
  ]) {
    // biome-ignore lint/performance/noAwaitInLoops: ordered migrations
    await postgres.exec(await readFile(`drizzle/${file}`, "utf8"));
  }
  await postgres.exec(`
    INSERT INTO users (id, email, name) VALUES ('author', 'author@example.invalid', 'Author');
    INSERT INTO exercises (id, slug, display_name, creator_id) VALUES (1, 'test', 'Test', 'author');
    INSERT INTO exercise_chat_generation (id, exercise_id, user_id, prompt, status, code_blob_key, sandbox_id)
      VALUES (1, 1, 'author', 'Test', 'COMPLETED', 'generations/test.zip', 'production-exercise-preview-1-1234abcd');
  `);
  const { db } = await import("../lib/db");
  Object.assign(db.query, database.query);
  mock.method(
    db,
    "insert",
    database.insert.bind(database) as unknown as typeof db.insert
  );
  mock.method(
    db,
    "update",
    database.update.bind(database) as unknown as typeof db.update
  );

  mock.method(Snapshot, "list", (() =>
    Promise.resolve([
      { id: "isolated-test-snapshot", status: "created" },
    ])) as unknown as typeof Snapshot.list);
  mock.method(Sandbox, "getOrCreate", ((options: {
    name: string;
    tags: Record<string, string>;
  }) => {
    calls.push({ method: "getOrCreate", ...options });
    return Promise.resolve(fakeSandbox(options.name));
  }) as unknown as typeof Sandbox.getOrCreate);
  mock.method(Sandbox, "create", ((options: {
    name: string;
    tags: Record<string, string>;
  }) => {
    calls.push({ method: "create", ...options });
    return Promise.resolve(fakeSandbox(options.name));
  }) as unknown as typeof Sandbox.create);
  mock.method(Sandbox, "get", (({ name }: { name: string }) => {
    calls.push({ method: "get", name });
    return Promise.resolve(fakeSandbox(name));
  }) as unknown as typeof Sandbox.get);
  const archive = createZipBuffer([
    { content: "// test", path: "app/exercises/test/test.schema.ts" },
  ]);
  mock.method(globalThis, "fetch", async (url: string | URL | Request) =>
    String(url).includes("generations/")
      ? new Response(new Uint8Array(archive))
      : new Response("ready")
  );
  process.env.NEXT_PUBLIC_BLOB_URL = "https://blob.example.invalid";
  repository = await import("../lib/ai/workspace-repository");
  sandboxes = await import("../lib/ai/exercise-workspace");
});

after(async () => {
  mock.restoreAll();
  if (originalNamespace === undefined) {
    delete process.env.SANDBOX_NAMESPACE;
  } else {
    process.env.SANDBOX_NAMESPACE = originalNamespace;
  }
  await postgres.close();
});

test("namespace is mandatory, validated without lossy normalization and bounded", () => {
  for (const value of [
    "",
    "Production",
    " preview ",
    "../prod",
    "-prod",
    "prod-",
    "a".repeat(25),
  ]) {
    assert.throws(() => getSandboxNamespace(value), INVALID_NAMESPACE);
  }
  assert.equal(getSandboxNamespace("preview-pr-31"), "preview-pr-31");
  assert.equal(getSandboxNamespace("a"), "a");
  process.env.SANDBOX_NAMESPACE = "a".repeat(24);
  assert.ok(getPreviewSandboxName(2_147_483_647).length <= 63);
  process.env.SANDBOX_NAMESPACE = "local-test";
});

test("same IDs get distinct identities; preview matching is exact", () => {
  process.env.SANDBOX_NAMESPACE = "production";
  const production = getWorkspaceIdentity(1);
  const preview = getPreviewSandboxName(1);
  process.env.SANDBOX_NAMESPACE = "local-test";
  const local = getWorkspaceIdentity(1);
  assert.notEqual(production.sandboxName, local.sandboxName);
  assert.notEqual(production.harnessSessionId, local.harnessSessionId);
  assert.equal(canReusePreviewSandbox(preview, 1), false);
  assert.equal(
    canReusePreviewSandbox("local-test-exercise-preview-11-1234abcd", 1),
    false
  );
  assert.equal(
    canReusePreviewSandbox("local-test-exercise-preview-1-1234abcd-extra", 1),
    false
  );
  assert.equal(canReusePreviewSandbox("exercise-preview-1-1234abcd", 1), false);
  assert.equal(
    canReusePreviewSandbox("local-test-exercise-preview-1-1234abcd", 1),
    true
  );
  assert.throws(
    () =>
      assertWorkspaceIdentity(
        { harnessSessionId: "exercise-1", sandboxName: null },
        1
      ),
    WRONG_WORKSPACE
  );
  assert.throws(
    () =>
      assertWorkspaceIdentity(
        {
          harnessSessionId: local.harnessSessionId,
          sandboxName: production.sandboxName,
        },
        1
      ),
    WRONG_WORKSPACE
  );
});

test("workspace uses namespace tags and preserves sessions within that namespace", async () => {
  const first = await repository.getOrCreateExerciseWorkspace(1);
  assert.equal(first.harnessSessionId, "local-test-exercise-1");
  const exercise = await database.query.exercises.findFirst();
  assert.ok(exercise);
  await sandboxes.getExerciseWorkspaceSandbox({
    checkpointBlobKey: null,
    exercise,
  });
  assert.equal(calls.at(-1)?.name, "local-test-exercise-workspace-1");
  assert.equal(calls.at(-1)?.tags?.namespace, "local-test");
  assert.equal(
    (await repository.getOrCreateExerciseWorkspace(1)).harnessSessionId,
    first.harnessSessionId
  );
  assert.ok(await repository.claimExerciseWorkspace(1, 1));
  assert.equal(await repository.claimExerciseWorkspace(1, 1), null);
  assert.ok(await repository.refreshExerciseWorkspaceLock(1, 1));
  assert.ok(await repository.releaseExerciseWorkspace(1, 1));
  await assert.rejects(
    repository.updateExerciseWorkspace(1, {
      sandboxName: "production-exercise-workspace-1",
    }),
    FOREIGN_SANDBOX
  );
});

test("cloned workspace is rejected before SDK access or stale resume reuse", async () => {
  const count = calls.length;
  process.env.SANDBOX_NAMESPACE = "preview-pr-31";
  const exercise = await database.query.exercises.findFirst();
  assert.ok(exercise);
  await assert.rejects(
    sandboxes.getExerciseWorkspaceSandbox({
      checkpointBlobKey: null,
      exercise,
    }),
    WRONG_WORKSPACE
  );
  assert.equal(calls.length, count);
  assert.equal(await repository.releaseExerciseWorkspace(1, 1, {}), null);
  process.env.SANDBOX_NAMESPACE = "local-test";
});

test("foreign previews are recreated, current previews are reusable", async () => {
  const exercise = await database.query.exercises.findFirst();
  assert.ok(exercise);
  const start = calls.length;
  await sandboxes.getGenerationPreviewSandbox({
    checkpointBlobKey: "generations/test.zip",
    exercise,
    generationId: 1,
    sandboxName: "production-exercise-preview-1-1234abcd",
  });
  assert.deepEqual(
    calls.slice(start).map((call) => call.method),
    ["create"]
  );
  const createdName = calls.at(-1)?.name;
  assert.ok(createdName);
  assert.equal(calls.at(-1)?.tags?.namespace, "local-test");
  await sandboxes.getGenerationPreviewSandbox({
    checkpointBlobKey: "generations/test.zip",
    exercise,
    generationId: 1,
    sandboxName: createdName,
  });
  assert.equal(calls.at(-1)?.method, "get");
  assert.equal(calls.at(-1)?.name, createdName);
});

test("reset refuses live locks and clears cloned references while preserving checkpoints", async () => {
  await postgres.exec(`UPDATE exercise_workspaces SET active_generation_id = 1,
    lock_expires_at = now() + interval '10 minutes', harness_resume_state = '{"old":true}';`);
  process.env.SANDBOX_NAMESPACE = "preview-pr-31";
  await assert.rejects(resetSandboxReferences(client), ACTIVE_LOCK);
  assert.equal(
    (await database.query.exerciseWorkspaces.findFirst())?.harnessSessionId,
    "local-test-exercise-1"
  );
  await postgres.exec(`UPDATE exercise_workspaces SET lock_expires_at = now() - interval '1 minute';
    UPDATE exercise_chat_generation SET status = 'GENERATING';`);
  const count = calls.length;
  assert.deepEqual(await resetSandboxReferences(client), {
    previews: 1,
    workspaces: 1,
  });
  assert.equal(calls.length, count);
  const workspace = await repository.getOrCreateExerciseWorkspace(1);
  assert.equal(workspace.harnessSessionId, "preview-pr-31-exercise-1");
  assert.equal(workspace.sandboxName, null);
  assert.equal(workspace.harnessResumeState, null);
  assert.equal(workspace.activeGenerationId, null);
  assert.equal(workspace.lockExpiresAt, null);
  const generation = await database.query.exerciseChatGeneration.findFirst();
  assert.equal(generation?.sandboxId, null);
  assert.equal(generation?.codeBlobKey, "generations/test.zip");
  assert.equal(generation?.status, "ERROR");
  assert.deepEqual(await resetSandboxReferences(client), {
    previews: 0,
    workspaces: 1,
  });
});

test("a failed reset rolls back workspace and generation changes together", async () => {
  await postgres.exec(`
    UPDATE exercise_workspaces SET harness_session_id = 'exercise-1',
      sandbox_name = 'exercise-workspace-1', harness_resume_state = '{"old":true}';
    UPDATE exercise_chat_generation SET status = 'GENERATING', sandbox_id = 'old-preview';
  `);
  const failedClient = {
    query: (text: string, values?: unknown[]) => {
      if (text.startsWith("UPDATE exercise_chat_generation SET sandbox_id")) {
        return Promise.reject(new Error("Simulated preview reset failure"));
      }
      return client.query(text, values);
    },
  };
  await assert.rejects(resetSandboxReferences(failedClient), {
    message: "Simulated preview reset failure",
  });
  const workspace = await database.query.exerciseWorkspaces.findFirst();
  assert.equal(workspace?.harnessSessionId, "exercise-1");
  assert.equal(workspace?.sandboxName, "exercise-workspace-1");
  assert.deepEqual(workspace?.harnessResumeState, { old: true });
  const generation = await database.query.exerciseChatGeneration.findFirst();
  assert.equal(generation?.status, "GENERATING");
  assert.equal(generation?.sandboxId, "old-preview");
});

test("missing namespace fails before workspace database writes and preview SDK calls", async () => {
  delete process.env.SANDBOX_NAMESPACE;
  const count = calls.length;
  await assert.rejects(
    repository.getOrCreateExerciseWorkspace(2),
    INVALID_NAMESPACE
  );
  const exercise = await database.query.exercises.findFirst();
  assert.ok(exercise);
  await assert.rejects(
    sandboxes.getGenerationPreviewSandbox({
      checkpointBlobKey: "generations/test.zip",
      exercise,
      generationId: 1,
      sandboxName: null,
    }),
    INVALID_NAMESPACE
  );
  assert.equal(calls.length, count);
  assert.equal((await database.query.exerciseWorkspaces.findMany()).length, 1);
  process.env.SANDBOX_NAMESPACE = "local-test";
});
