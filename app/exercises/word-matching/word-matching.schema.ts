import { z } from "zod";
import {
  baseExerciseConfigSchema,
  type ExercisePreset,
} from "@/lib/schemas/base-schemas";
import { wordGroups } from "./word-groups-dataset";

// Word matching specific configuration schema
export const wordMatchingSpecificConfigSchema = z.object({
  groupsPerRound: z.coerce
    .number()
    .min(3, "Mínimo 3 grupos por ronda")
    .max(6, "Máximo 6 grupos por ronda")
    .int("El número de grupos debe ser un número entero"),
});

// Reusable refinement function for word matching configurations
export function wordMatchingConfigRefinements(
  data: z.infer<typeof wordMatchingSpecificConfigSchema>,
  ctx: z.RefinementCtx
) {
  if (data.groupsPerRound > wordGroups.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No hay suficientes grupos de palabras disponibles (necesarios: ${data.groupsPerRound}, disponibles: ${wordGroups.length})`,
      path: ["groupsPerRound"],
    });
  }
}

// Complete config schema
export const configSchema = baseExerciseConfigSchema
  .merge(wordMatchingSpecificConfigSchema)
  .superRefine(wordMatchingConfigRefinements);

// Result schema for a single round
export const resultSchema = z.object({
  expectedGroups: z.array(
    z.object({
      object: z.string(),
      category: z.string(),
      characteristic: z.string(),
    })
  ),
  correctMatches: z.number().int().min(0),
  incorrectAttempts: z.number().int().min(0),
  totalAttempts: z.number().int().min(0),
  timeSpent: z.number().min(0),
});

export type WordMatchingSpecificConfig = z.infer<
  typeof wordMatchingSpecificConfigSchema
>;
export type WordMatchingConfig = z.infer<typeof configSchema>;
export type WordMatchingQuestionResult = z.infer<typeof resultSchema>;

export const presets: Record<ExercisePreset, WordMatchingSpecificConfig> = {
  easy: {
    groupsPerRound: 3,
  },
  medium: {
    groupsPerRound: 4,
  },
  hard: {
    groupsPerRound: 5,
  },
  expert: {
    groupsPerRound: 6,
  },
};

export const defaultConfig: WordMatchingConfig = {
  endConditionType: "time",
  automaticNextQuestion: true,
  totalQuestions: 0,
  timeLimitSeconds: 120,
  ...presets.easy,
};
