import { tool } from "ai";
import {
  askUserQuestionInputSchema,
  askUserQuestionOutputSchema,
  proposeExerciseBriefInputSchema,
  proposeExerciseBriefOutputSchema,
} from "@/lib/schemas/exercise-refinement";

export const askUserQuestionTool = tool({
  description:
    "Ask the professional one important question as an interactive card. This is the only way to ask a question. The card supports choices, free text, and a combination of both.",
  inputSchema: askUserQuestionInputSchema,
  outputSchema: askUserQuestionOutputSchema,
});

export const proposeExerciseBriefTool = tool({
  description:
    "Present the complete exercise specification for approval. Call this as soon as the request is sufficiently clear or the question limit has been reached.",
  inputSchema: proposeExerciseBriefInputSchema,
  outputSchema: proposeExerciseBriefOutputSchema,
});
