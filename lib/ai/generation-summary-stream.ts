import type { UIMessageChunk } from "ai";

export function createGenerationSummaryStream() {
  let finishChunk: UIMessageChunk | undefined;
  let textBuffer: UIMessageChunk[] = [];

  return new TransformStream<UIMessageChunk, UIMessageChunk>({
    flush(controller) {
      for (const chunk of textBuffer) {
        controller.enqueue(chunk);
      }
      if (finishChunk) {
        controller.enqueue(finishChunk);
      }
    },
    transform(chunk, controller) {
      // Preview initialization must wait until the upstream onEnd has saved
      // the checkpoint and generation state. Defer finish until stream flush.
      if (chunk.type === "finish") {
        finishChunk = chunk;
        return;
      }
      // Discard internal commentary when a tool follows it. Only text that
      // survives to a step boundary (or stream end) is shown to the author.
      if (
        chunk.type === "text-start" ||
        chunk.type === "text-delta" ||
        chunk.type === "text-end"
      ) {
        textBuffer.push(chunk);
        return;
      }
      if (chunk.type === "finish-step") {
        for (const buffered of textBuffer) {
          controller.enqueue(buffered);
        }
        textBuffer = [];
        controller.enqueue(chunk);
        return;
      }
      textBuffer = [];
      if (chunk.type.startsWith("tool-")) {
        return;
      }
      controller.enqueue(chunk);
    },
  });
}
