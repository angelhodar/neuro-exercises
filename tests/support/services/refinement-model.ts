import type { LanguageModelV4StreamPart } from "@ai-sdk/provider";
import { MockLanguageModelV4 } from "ai/test";
import { brief } from "../../fixtures/brief";
import { assertTestEnvironment } from "../environment";

export const refinementModel = new MockLanguageModelV4({
  doStream: ({ prompt }) => {
    assertTestEnvironment();
    const content = JSON.stringify(prompt);
    const hasAnswer =
      content.includes("askUserQuestion") && content.includes('"role":"tool"');
    const revised = content.includes("Aumentar a tres intentos");
    const toolName = hasAnswer ? "proposeExerciseBrief" : "askUserQuestion";
    const input = hasAnswer
      ? {
          brief: {
            ...brief,
            ...(revised ? { completionCriteria: "Tres intentos" } : {}),
          },
        }
      : {
          options: [{ label: "Dos" }, { label: "Tres" }],
          question: "¿Cuántos intentos?",
        };
    const chunks: LanguageModelV4StreamPart[] = [
      { type: "stream-start", warnings: [] },
      {
        input: JSON.stringify(input),
        toolCallId: crypto.randomUUID(),
        toolName,
        type: "tool-call",
      },
      ...(hasAnswer
        ? []
        : [
            {
              input: JSON.stringify({ brief }),
              toolCallId: crypto.randomUUID(),
              toolName: "proposeExerciseBrief",
              type: "tool-call" as const,
            },
          ]),
      {
        finishReason: { raw: "tool-calls", unified: "tool-calls" },
        type: "finish",
        usage: {
          inputTokens: { cacheRead: 0, cacheWrite: 0, noCache: 0, total: 0 },
          outputTokens: { reasoning: 0, text: 0, total: 0 },
        },
      },
    ];
    return Promise.resolve({
      stream: new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      }),
    });
  },
});
