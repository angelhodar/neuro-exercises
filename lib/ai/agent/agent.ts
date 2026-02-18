import type { Sandbox } from "@vercel/sandbox";
import { hasToolCall, ToolLoopAgent } from "ai";
import { updateExerciseGeneration } from "@/app/actions/generations";
import { systemPrompt } from "./prompts";
import type { createAgentTools } from "./tools";

interface CreateAgentOptions {
  tools: ReturnType<typeof createAgentTools>;
  sandbox: Sandbox;
  generationId: number;
}

export function createExerciseAgent({
  tools,
  sandbox,
  generationId,
}: CreateAgentOptions) {
  return new ToolLoopAgent({
    model: "anthropic/claude-sonnet-4.6",
    instructions: systemPrompt,
    tools,
    stopWhen: hasToolCall("writeFiles"),
    providerOptions: {
      anthropic: {
        effort: "medium",
        thinking: { type: "adaptive" },
      },
    },
    onStepFinish: (event) => {
      console.log(event.text);
    },
    onFinish: async (event) => {
      console.log("Agent finished, updating generation...");
      await updateExerciseGeneration(generationId, {
        status: "COMPLETED",
        summary: event.text,
        sandboxId: sandbox.sandboxId,
      });
    },
  });
}
