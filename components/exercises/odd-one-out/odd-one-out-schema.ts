import { z } from "zod";
import { baseExerciseConfigSchema } from "@/lib/schemas/base-schemas";

const selectedMediaSchema = z.object({
  id: z.number(),
  name: z.string(),
  blobKey: z.string(),
  tags: z.array(z.string())
});

// Schema for a single question configuration
export const oddOneOutQuestionSchema = z.object({
  patternMedias: z
    .array(selectedMediaSchema)
    .min(2, "Cada pregunta debe tener al menos 2 imágenes de patrón."),
  outlierMedia: selectedMediaSchema.nullable(),
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

  // Refine 2: Each question must have an outlier selected
  data.questions.forEach((question, index) => {
    if (!question.outlierMedia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes seleccionar una imagen 'diferente'.",
        path: [`questions`, index, 'outlierMedia'],
      });
    }
  });
});

export type OddOneOutConfig = z.infer<typeof oddOneOutConfigSchema>;
export type OddOneOutQuestion = z.infer<typeof oddOneOutQuestionSchema>;

export const defaultOddOneOutConfig: OddOneOutConfig = {
  totalQuestions: 1, // Start with one question by default
  timeLimitPerQuestion: 0,
  questions: [
    {
      patternMedias: [],
      outlierMedia: null,
    },
  ],
}; 