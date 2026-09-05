import { type InferAgentUIMessage, ToolLoopAgent } from "ai";
import { z } from "zod";
import { buildRefinementPrompt } from "./prompt";
import { askUserQuestionTool, proposeExerciseBriefTool } from "./tools";

export const exerciseRefinementAgent = new ToolLoopAgent({
  callOptionsSchema: z.object({
    canAskQuestion: z.boolean(),
    questionsAsked: z.number().int().min(0),
  }),
  model: "google/gemini-3.8-flash",
  prepareCall: ({ options, ...settings }) => ({
    ...settings,
    activeTools: options.canAskQuestion
      ? (["askUserQuestion", "proposeExerciseBrief"] as const)
      : (["proposeExerciseBrief"] as const),
    instructions: buildRefinementPrompt(options),
    toolChoice: options.canAskQuestion
      ? "required"
      : ({ toolName: "proposeExerciseBrief", type: "tool" } as const),
  }),
  tools: {
    askUserQuestion: askUserQuestionTool,
    proposeExerciseBrief: proposeExerciseBriefTool,
  },
});

export type ExerciseRefinementMessage = InferAgentUIMessage<
  typeof exerciseRefinementAgent
>;
