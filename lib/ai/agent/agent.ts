import { HarnessAgent } from "@ai-sdk/harness/agent";
import { createPi } from "@ai-sdk/harness-pi";
import { z } from "zod";
import { buildSystemPrompt } from "./prompts";

const pi = createPi({
  auth: "ai-gateway",
  thinkingLevel: "medium",
});

export const exerciseAgent = new HarnessAgent({
  callOptionsSchema: z.object({ slug: z.string() }),
  harness: pi,
  model: "anthropic/claude-sonnet-5",
  permissionMode: "allow-all",
  prepareCall: ({ options, ...call }) => ({
    ...call,
    instructions: buildSystemPrompt(options.slug),
  }),
  sandboxConfig: {
    workDir: "neuro-exercises",
  },
});
