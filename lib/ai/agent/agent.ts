import type { Sandbox } from "@vercel/sandbox";
import { hasToolCall, ToolLoopAgent } from "ai";
import { updateExerciseGeneration } from "@/app/actions/generations";
import { buildSystemPrompt } from "./prompts";
import type { createAgentTools } from "./tools";

interface CreateAgentOptions {
  generationId: number;
  sandbox: Sandbox;
  slug: string;
  tools: ReturnType<typeof createAgentTools>;
}

export function createExerciseAgent({
  tools,
  sandbox,
  generationId,
  slug,
}: CreateAgentOptions) {
  return new ToolLoopAgent({
    instructions: buildSystemPrompt(slug),
    model: "anthropic/claude-sonnet-4.6",
    onFinish: async (event) => {
      console.log("Agent finished, updating generation...");
      await updateExerciseGeneration(generationId, {
        status: "COMPLETED",
        summary: event.text,
      });

      try {
        await sandbox.stop();
      } catch (error) {
        console.error("Failed to stop agent sandbox:", error);
      }
    },
    onStepFinish: (event) => {
      console.log(event.text);
    },
    providerOptions: {
      anthropic: {
        effort: "medium",
        thinking: { type: "adaptive" },
      },
    },
    stopWhen: hasToolCall("writeFiles"),
    tools,
  });
}
