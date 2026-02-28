import { z } from "zod";
import { baseExerciseConfigSchema } from "@/lib/schemas/base-schemas";
import { wordGroups } from "./word-groups-dataset";

// Word matching specific configuration schema
export const wordMatchingSpecificConfigSchema = z.object({
  groupsPerRound: z.coerce
    .number()
    .min(3, "Mínimo 3 grupos por ronda")
    .max(6, "Máximo 6 grupos por ronda")
    .int("El número de grupos debe ser un número entero"),
  numberOfColumns: z.coerce
    .number()
    .min(2, "Mínimo 2 columnas")
    .max(4, "Máximo 4 columnas")
    .int("El número de columnas debe ser un número entero"),
  requirePhrase: z.boolean().default(false),
});

// Reusable refinement function for word matching configurations
export function wordMatchingConfigRefinements(
  data: z.infer<typeof baseExerciseConfigSchema> &
    z.infer<typeof wordMatchingSpecificConfigSchema>,
  ctx: z.RefinementCtx
) {
  if (data.groupsPerRound > wordGroups.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No hay suficientes grupos de palabras disponibles (necesarios: ${data.groupsPerRound}, disponibles: ${wordGroups.length})`,
      path: ["groupsPerRound"],
    });
  }

  if (
    data.endConditionType === "time" &&
    (!data.timeLimitSeconds || data.timeLimitSeconds <= 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "El tiempo límite debe ser mayor que 0 cuando la condición de finalización es por tiempo",
      path: ["timeLimitSeconds"],
    });
  }
}

// Complete config schema
export const configSchema = baseExerciseConfigSchema
  .merge(wordMatchingSpecificConfigSchema)
  .superRefine(wordMatchingConfigRefinements);

// Schema for each individual match attempt
const matchAttemptSchema = z.object({
  words: z.array(z.string()),
  isCorrect: z.boolean(),
});

// Result schema for a single round
export const resultSchema = z.object({
  expectedGroups: z.array(
    z.object({
      object: z.string(),
      category: z.string(),
      characteristic: z.string(),
      action: z.string(),
    })
  ),
  matchAttempts: z.array(matchAttemptSchema),
  correctMatches: z.number().int().min(0),
  incorrectAttempts: z.number().int().min(0),
  totalAttempts: z.number().int().min(0),
  timeSpent: z.number().min(0),
  phrases: z
    .array(
      z.object({
        expected: z.string(),
        entered: z.string(),
      })
    )
    .optional(),
});

export type MatchAttempt = z.infer<typeof matchAttemptSchema>;

export type WordMatchingSpecificConfig = z.infer<
  typeof wordMatchingSpecificConfigSchema
>;
export type WordMatchingConfig = z.infer<typeof configSchema>;
export type WordMatchingQuestionResult = z.infer<typeof resultSchema>;

export const defaultConfig: WordMatchingConfig = {
  endConditionType: "questions",
  automaticNextQuestion: true,
  totalQuestions: 5,
  timeLimitSeconds: 0,
  groupsPerRound: 3,
  numberOfColumns: 2,
  requirePhrase: false,
};
