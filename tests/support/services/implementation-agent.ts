import type { ModelMessage, TextStreamPart, ToolSet } from "ai";
import { withTestDatabase } from "../database";
import { assertTestEnvironment } from "../environment";

export const exerciseAgent = {
  createSession() {
    assertTestEnvironment();
    return Promise.resolve({
      destroy: () => Promise.resolve(),
      detach: () => Promise.resolve({ fixture: true }),
    });
  },
  async stream({
    messages,
    options,
  }: {
    messages: ModelMessage[];
    options: { slug: string };
  }) {
    assertTestEnvironment();
    if (JSON.stringify(messages.at(-1)).includes("fallar generación")) {
      const failed = await withTestDatabase((pool) =>
        pool.query(
          "SELECT 1 FROM exercise_chat_generation g JOIN exercises e ON e.id = g.exercise_id WHERE e.slug = $1 AND g.status = 'ERROR'",
          [options.slug]
        )
      );
      if (failed.rowCount === 0) {
        throw new Error("Fallo de generación de prueba");
      }
    }
    const chunks: TextStreamPart<ToolSet>[] = [
      { type: "start" },
      { id: "summary", type: "text-start" },
      {
        id: "summary",
        text: "Ejercicio preparado para previsualizar.",
        type: "text-delta",
      },
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
    return {
      stream: new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      }),
    };
  },
};
