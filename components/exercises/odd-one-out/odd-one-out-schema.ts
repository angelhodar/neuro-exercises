import { z } from "zod";
import { baseExerciseConfigSchema } from "@/lib/schemas/base-schemas";
import { selectableMediaSchema } from "@/lib/schemas/medias";

// Schema for a single question configuration
export const oddOneOutQuestionSchema = z.object({
  patternMedias: z
    .array(selectableMediaSchema)
    .min(2, "Cada pregunta debe tener al menos 2 imágenes de patrón."),
  outlierMedia: selectableMediaSchema,
});

// Main configuration schema for the exercise
export const oddOneOutConfigSchema = baseExerciseConfigSchema.extend({
  questions: z
    .array(oddOneOutQuestionSchema)
    .min(1, "Debes configurar al menos una pregunta."),
}).superRefine((data, ctx) => {
  // Refine 1: The number of questions must match the array length
  if (data.questions.length !== data.totalQuestions) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El número total de preguntas debe coincidir con las preguntas configuradas.",
      path: ["totalQuestions"],
    });
  }

  // Refine 2: Cada pregunta debe tener un outlier definido (ya forzado por el schema)
});

export const oddOneOutResultSchema = z.object({
  questionIndex: z.number(),
  isCorrect: z.boolean(),
  selectedId: z.number(),
  correctId: z.number(),
});

export type OddOneOutConfig = z.infer<typeof oddOneOutConfigSchema>;
export type OddOneOutQuestion = z.infer<typeof oddOneOutQuestionSchema>;
export type OddOneOutResult = z.infer<typeof oddOneOutResultSchema>;

export const defaultOddOneOutConfig: OddOneOutConfig = {
  totalQuestions: 1, // Start with one question by default
  timeLimitPerQuestion: 0,
  questions: [
    {
      patternMedias: [],
      outlierMedia: { id: 0, name: "", blobKey: "", tags: [] },
    },
  ],
}; 