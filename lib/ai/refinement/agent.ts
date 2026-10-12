import { type InferAgentUIMessage, ToolLoopAgent } from "ai";
import { z } from "zod";
import { refinementModel } from "@/lib/ai/refinement/model";
import { buildRefinementPrompt } from "./prompt";
import { askUserQuestionTool, proposeExerciseBriefTool } from "./tools";

export const exerciseRefinementAgent = new ToolLoopAgent({
  callOptionsSchema: z.object({
    canAskQuestion: z.boolean(),
    isRevisingBrief: z.boolean(),
    questionsAsked: z.number().int().min(0),
  }),
  model: refinementModel,
  prepareCall: ({ options, ...settings }) => ({
    ...settings,
    activeTools:
      options.canAskQuestion && !options.isRevisingBrief
        ? (["askUserQuestion", "proposeExerciseBrief"] as const)
        : (["proposeExerciseBrief"] as const),
    instructions: buildRefinementPrompt(options),
    toolChoice:
      options.canAskQuestion && !options.isRevisingBrief
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
