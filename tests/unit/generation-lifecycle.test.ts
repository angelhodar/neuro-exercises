import assert from "node:assert/strict";
import { type TestContext, test } from "node:test";
import type { HarnessAgentResumeSessionState } from "@ai-sdk/harness/agent";
import type { Sandbox } from "@vercel/sandbox";
import type { UIMessage } from "ai";
import { createGenerationLifecycle } from "../../lib/ai/generation-lifecycle";

const sandbox = {} as Sandbox;
const responseMessage: UIMessage = {
  id: "response",
  parts: [
    { text: "Internal commentary", type: "text" },
    { text: "Final summary", type: "text" },
  ],
  role: "assistant",
};
const completed = {
  isAborted: false,
  outcome: { status: "completed" },
  responseMessage,
};
const resumeState: HarnessAgentResumeSessionState = {
  data: { session: "local" },
  harnessId: "test",
  specificationVersion: "harness-v1",
  type: "resume-session",
};

function fixture(
  t: TestContext,
  options: {
    checkpointError?: boolean;
    detachError?: boolean;
    updateError?: boolean;
    releaseError?: boolean;
  } = {}
) {
  t.mock.timers.enable({ apis: ["setInterval"] });
  const calls: { method: string; args: unknown[] }[] = [];
  const lifecycle = createGenerationLifecycle(
    { exerciseId: 1, generationId: 2, slug: "test" },
    {
      createCheckpoint: (...args) => {
        calls.push({ args, method: "checkpoint" });
        if (options.checkpointError) {
          return Promise.reject(new Error("Checkpoint failed"));
        }
        return Promise.resolve("generations/test.zip");
      },
      refreshLock: (...args) => {
        calls.push({ args, method: "heartbeat" });
        return Promise.resolve();
      },
      releaseWorkspace: (...args) => {
        calls.push({ args, method: "release" });
        return Promise.resolve(
          options.releaseError && args[2]?.lastError === null ? null : { id: 1 }
        );
      },
      updateGeneration: (...args) => {
        calls.push({ args, method: "update" });
        return Promise.resolve(
          options.updateError && args[1].status === "COMPLETED"
            ? null
            : { id: 2 }
        );
      },
    }
  );
  const session = {
    destroy: () => {
      calls.push({ args: [], method: "destroy" });
      return Promise.resolve();
    },
    detach: () => {
      calls.push({ args: [], method: "detach" });
      if (options.detachError) {
        return Promise.reject(new Error("Detach failed"));
      }
      return Promise.resolve(resumeState);
    },
  };
  return { calls, lifecycle, session };
}

test("completion checkpoints, detaches, saves final summary, releases lock, then stops heartbeat", async (t) => {
  const { calls, lifecycle, session } = fixture(t);
  lifecycle.attachSession(session);
  t.mock.timers.tick(60_000);
  assert.deepEqual(calls, [{ args: [1, 2], method: "heartbeat" }]);
  calls.length = 0;
  await lifecycle.onEnd(sandbox, completed);
  assert.deepEqual(calls, [
    { args: [sandbox, "test"], method: "checkpoint" },
    { args: [], method: "detach" },
    {
      args: [
        2,
        {
          codeBlobKey: "generations/test.zip",
          status: "COMPLETED",
          summary: "Final summary",
        },
      ],
      method: "update",
    },
    {
      args: [1, 2, { harnessResumeState: resumeState, lastError: null }],
      method: "release",
    },
  ]);
  t.mock.timers.tick(120_000);
  await lifecycle.destroySession();
  assert.equal(calls.length, 4);
});

test("aborted and incomplete turns save recovery state without creating a checkpoint", async (t) => {
  const { calls, lifecycle, session } = fixture(t);
  lifecycle.attachSession(session);
  await assert.rejects(
    lifecycle.onEnd(sandbox, { ...completed, isAborted: true }),
    { message: "La generación no se completó" }
  );
  assert.deepEqual(calls, [
    { args: [], method: "detach" },
    { args: [2, { status: "ERROR" }], method: "update" },
    {
      args: [
        1,
        2,
        {
          harnessResumeState: resumeState,
          lastError: "La generación no se completó",
        },
      ],
      method: "release",
    },
  ]);
  calls.length = 0;
  await assert.rejects(
    lifecycle.onEnd(sandbox, { ...completed, outcome: { status: "failed" } }),
    { message: "La generación no se completó" }
  );
  assert.deepEqual(
    calls.map((call) => call.method),
    ["update", "release"]
  );
  t.mock.timers.tick(60_000);
  assert.equal(calls.length, 2);
});

test("checkpoint failures park the session and report failure instead of publishing", async (t) => {
  const { calls, lifecycle, session } = fixture(t, { checkpointError: true });
  lifecycle.attachSession(session);
  await assert.rejects(lifecycle.onEnd(sandbox, completed), {
    message: "Checkpoint failed",
  });
  assert.deepEqual(
    calls.map((call) => call.method),
    ["checkpoint", "detach", "update", "release"]
  );
  assert.deepEqual(calls.at(-1)?.args, [
    1,
    2,
    { harnessResumeState: resumeState, lastError: "Checkpoint failed" },
  ]);
});

test("failed detach still marks the generation failed and releases its lock", async (t) => {
  t.mock.method(console, "error", () => undefined);
  const { calls, lifecycle, session } = fixture(t, { detachError: true });
  lifecycle.attachSession(session);
  await lifecycle.fail(new Error("Generation failed"));
  assert.deepEqual(
    calls.map((call) => call.method),
    ["detach", "update", "release"]
  );
  assert.deepEqual(calls.at(-1)?.args, [
    1,
    2,
    { lastError: "Generation failed" },
  ]);
});

test("persistence failures retain existing error and release behavior after detaching", async (t) => {
  const { calls, lifecycle, session } = fixture(t, { updateError: true });
  lifecycle.attachSession(session);
  await assert.rejects(lifecycle.onEnd(sandbox, completed), {
    message: "No se pudo guardar la generación",
  });
  assert.deepEqual(
    calls.map((call) => call.method),
    ["checkpoint", "detach", "update", "update", "release"]
  );
  assert.deepEqual(calls.at(-1)?.args, [
    1,
    2,
    { lastError: "No se pudo guardar la generación" },
  ]);
});

test("failed completion release follows the existing failure path", async (t) => {
  const { calls, lifecycle, session } = fixture(t, { releaseError: true });
  lifecycle.attachSession(session);
  await assert.rejects(lifecycle.onEnd(sandbox, completed), {
    message: "No se pudo liberar el espacio de trabajo",
  });
  assert.deepEqual(
    calls.map((call) => call.method),
    ["checkpoint", "detach", "update", "release", "update", "release"]
  );
  t.mock.timers.tick(60_000);
  assert.equal(calls.length, 6);
});

test("setup failures destroy only active sessions before recording the error", async (t) => {
  const { calls, lifecycle, session } = fixture(t);
  lifecycle.attachSession(session);
  await lifecycle.destroySession();
  await lifecycle.fail("Unknown error");
  assert.deepEqual(calls, [
    { args: [], method: "destroy" },
    { args: [2, { status: "ERROR" }], method: "update" },
    { args: [1, 2, { lastError: "Error desconocido" }], method: "release" },
  ]);
  await lifecycle.destroySession();
  assert.equal(calls.length, 3);
});

test("missing sessions cannot complete a generation", async (t) => {
  const { calls, lifecycle } = fixture(t);
  await assert.rejects(lifecycle.onEnd(sandbox, completed), {
    message: "La sesión del agente no está disponible",
  });
  assert.deepEqual(
    calls.map((call) => call.method),
    ["checkpoint", "update", "release"]
  );
});

test("concurrent lifecycle instances do not share active sessions", async (t) => {
  const { calls, lifecycle, session } = fixture(t);
  lifecycle.attachSession(session);
  const otherCalls: string[] = [];
  const other = createGenerationLifecycle(
    { exerciseId: 3, generationId: 4, slug: "other" },
    {
      createCheckpoint: async () => "other.zip",
      refreshLock: async () => undefined,
      releaseWorkspace: () => {
        otherCalls.push("release");
        return Promise.resolve({});
      },
      updateGeneration: () => {
        otherCalls.push("update");
        return Promise.resolve({});
      },
    }
  );
  other.attachSession({
    destroy: () => {
      otherCalls.push("destroy");
      return Promise.resolve();
    },
    detach: () => {
      otherCalls.push("detach");
      return Promise.resolve(resumeState);
    },
  });
  await other.fail(new Error("Other failed"));
  assert.deepEqual(otherCalls, ["detach", "update", "release"]);
  assert.equal(calls.length, 0);
  await lifecycle.onEnd(sandbox, completed);
  assert.equal(calls[1].method, "detach");
});
