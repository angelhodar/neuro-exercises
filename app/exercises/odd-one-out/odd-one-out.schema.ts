import { z } from "zod";
import {
  baseExerciseConfigSchema,
  type ExercisePreset,
} from "@/lib/schemas/base-schemas";
import { selectableMediaSchema } from "@/lib/schemas/medias";

// Schema for a single question configuration
export const oddOneOutQuestionSchema = z.object({
  patternMedias: z
    .array(selectableMediaSchema)
    .min(2, "Cada pregunta debe tener al menos 2 imágenes de patrón."),
  outlierMedia: z
    .array(selectableMediaSchema)
    .max(1, "Cada pregunta debe tener máximo una imagen diferente."),
});

// Main configuration schema for the exercise
export const oddOneOutConfigSchema = baseExerciseConfigSchema
  .extend({
    questions: z
      .array(oddOneOutQuestionSchema)
      .min(1, "Debes configurar al menos una pregunta."),
  })
  .superRefine((data, ctx) => {
    // Refine 1: The number of questions must match the array length
    if (data.questions.length !== data.totalQuestions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El número total de preguntas debe coincidir con las preguntas configuradas.",
        path: ["totalQuestions"],
      });
    }

    // Refine 2: Cada pregunta debe tener un outlier definido (ya forzado por el schema)
    if (data.questions.some((question) => question.outlierMedia.length !== 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cada pregunta debe tener un outlier definido.",
        path: ["questions"],
      });
    }

    // Refine 3: Cada pregunta debe tener al menos 2 imágenes de patrón
    if (data.questions.some((question) => question.patternMedias.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cada pregunta debe tener al menos 2 imágenes de patrón.",
        path: ["questions"],
      });
    }
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

export const defaultConfig: OddOneOutConfig = {
  endConditionType: "questions",
  automaticNextQuestion: true,
  totalQuestions: 5,
  timeLimitSeconds: 0,
  questions: [
    {
      patternMedias: [],
      outlierMedia: [],
    },
  ],
};

export const oddOneOutPresets: Record<ExercisePreset, OddOneOutConfig> = {
  easy: defaultConfig,
  medium: defaultConfig,
  hard: defaultConfig,
  expert: defaultConfig,
};

// Exports required by the loader
export const configSchema = oddOneOutConfigSchema;
export const resultSchema = oddOneOutResultSchema;
export const presets = oddOneOutPresets;
