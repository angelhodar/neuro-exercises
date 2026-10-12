import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type TextStreamPart,
  type ToolSet,
  toUIMessageStream,
  type UIMessageChunk,
} from "ai";
import { createGenerationSummaryStream } from "../lib/ai/generation-summary-stream";

function text(id: string, delta: string): UIMessageChunk[] {
  return [
    { id, type: "text-start" },
    { delta, id, type: "text-delta" },
    { id, type: "text-end" },
  ];
}

async function filtered(chunks: UIMessageChunk[]) {
  const input = new ReadableStream<UIMessageChunk>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
  const output: UIMessageChunk[] = [];
  await input.pipeThrough(createGenerationSummaryStream()).pipeTo(
    new WritableStream<UIMessageChunk>({
      write(chunk) {
        output.push(chunk);
      },
    })
  );
  return output;
}

test("generation stream discards commentary and tool chunks, keeping final summary", async () => {
  const start: UIMessageChunk = { type: "start" };
  const summary = text("summary", "Done");
  const finish: UIMessageChunk = { type: "finish" };
  assert.deepEqual(
    await filtered([
      start,
      ...text("internal", "Looking at files"),
      { toolCallId: "call", toolName: "readFile", type: "tool-input-start" },
      {
        input: {},
        toolCallId: "call",
        toolName: "readFile",
        type: "tool-input-available",
      },
      { output: "file", toolCallId: "call", type: "tool-output-available" },
      ...summary,
      finish,
    ]),
    [start, ...summary, finish]
  );
});

test("generation stream retains text at step boundaries and forwards errors", async () => {
  const summary = text("summary", "Done");
  const boundary: UIMessageChunk = { type: "finish-step" };
  const error: UIMessageChunk = { errorText: "Failed", type: "error" };
  assert.deepEqual(await filtered([...summary, boundary, error]), [
    ...summary,
    boundary,
    error,
  ]);
  assert.deepEqual(await filtered([...text("internal", "Pending"), error]), [
    error,
  ]);
});

test("finish is held until upstream persistence completes and the stream closes", async () => {
  let close!: () => void;
  const input = new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: "start" });
      controller.enqueue({ type: "finish" });
      close = () => controller.close();
    },
  });
  const reader = input.pipeThrough(createGenerationSummaryStream()).getReader();
  assert.equal((await reader.read()).value?.type, "start");
  let finished = false;
  const pending = reader.read().then((result) => {
    finished = true;
    return result;
  });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(finished, false);
  // Upstream closes only after its awaited onEnd callback has persisted state.
  close();
  assert.equal((await pending).value?.type, "finish");
  assert.equal((await reader.read()).done, true);
});

test("stream buffers are request-local and empty streams are safe", async () => {
  const [first, second, empty] = await Promise.all([
    filtered([...text("one", "One"), { type: "finish" }]),
    filtered([...text("two", "Two"), { type: "finish" }]),
    filtered([]),
  ]);
  assert.deepEqual(first, [...text("one", "One"), { type: "finish" }]);
  assert.deepEqual(second, [...text("two", "Two"), { type: "finish" }]);
  assert.deepEqual(empty, []);
});

test("the installed SDK awaits onEnd before the filtered finish reaches the client", async () => {
  let startPersistence!: () => void;
  let finishPersistence!: () => void;
  const persistenceStarted = new Promise<void>((resolve) => {
    startPersistence = resolve;
  });
  const persistenceFinished = new Promise<void>((resolve) => {
    finishPersistence = resolve;
  });
  const chunks: TextStreamPart<ToolSet>[] = [
    { type: "start" },
    { id: "summary", type: "text-start" },
    { id: "summary", text: "Done", type: "text-delta" },
    { id: "summary", type: "text-end" },
    {
      finishReason: "stop",
      rawFinishReason: undefined,
      totalUsage: {
        inputTokenDetails: {
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          noCacheTokens: 0,
        },
        inputTokens: 0,
        outputTokenDetails: { reasoningTokens: 0, textTokens: 0 },
        outputTokens: 0,
        totalTokens: 0,
      },
      type: "finish",
    },
  ];
  const stream = new ReadableStream<TextStreamPart<ToolSet>>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
  const received: UIMessageChunk[] = [];
  const consuming = toUIMessageStream({
    onEnd: async (event) => {
      assert.equal(event.outcome.status, "completed");
      assert.deepEqual(event.responseMessage.parts, [
        {
          providerMetadata: undefined,
          state: "done",
          text: "Done",
          type: "text",
        },
      ]);
      startPersistence();
      await persistenceFinished;
    },
    stream,
  })
    .pipeThrough(createGenerationSummaryStream())
    .pipeTo(
      new WritableStream<UIMessageChunk>({
        write(chunk) {
          received.push(chunk);
        },
      })
    );
  await persistenceStarted;
  assert.equal(
    received.some((chunk) => chunk.type === "finish"),
    false
  );
  finishPersistence();
  await consuming;
  assert.equal(received.at(-1)?.type, "finish");
});
