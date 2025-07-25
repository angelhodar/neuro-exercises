import { z } from "zod";
import {
  explicitGoalSchema,
  type ExercisePreset,
} from "@/lib/schemas/base-schemas";
import {
  getWordsBySyllableCount,
  type SyllableCount,
} from "./spanish-words-dataset";

// Syllables specific configuration schema (in Spanish)
export const syllablesSpecificConfigSchema = z.object({
  syllablesCount: z.coerce
    .number()
    .min(3, "Mínimo 3 sílabas")
    .max(6, "Máximo 6 sílabas")
    .int("El número de sílabas debe ser un número entero"),
});

// Reusable refinement function for syllables configurations
export function syllablesConfigRefinements(
  data: z.infer<typeof syllablesSpecificConfigSchema>,
  ctx: z.RefinementCtx,
) {
  // Validate that we have words available for the selected syllable count
  const availableWords = getWordsBySyllableCount(
    data.syllablesCount as SyllableCount,
  );
  if (!availableWords || availableWords.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No hay palabras disponibles para ${data.syllablesCount} sílabas`,
      path: ["syllablesCount"],
    });
  }

  // Validate that we have enough words for the total questions
  if (availableWords && availableWords.length < 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No hay suficientes palabras disponibles para ${data.syllablesCount} sílabas (mínimo 5 necesarias)`,
      path: ["syllablesCount"],
    });
  }
}

// Complete syllables configuration schema - exported as configSchema
export const configSchema = explicitGoalSchema
  .merge(syllablesSpecificConfigSchema)
  .superRefine(syllablesConfigRefinements);

// Updated question result schema - exported as resultSchema
export const resultSchema = z.object({
  targetWord: z.string(),
  targetSyllables: z.array(z.string()),
  selectedSyllables: z.array(z.string()),
  timeSpent: z.number().min(0),
  timeExpired: z.boolean(),
});

export type SyllablesSpecificConfig = z.infer<
  typeof syllablesSpecificConfigSchema
>;
export type SyllablesConfig = z.infer<typeof configSchema>;
export type SyllablesQuestionResult = z.infer<typeof resultSchema>;

export const presets: Record<ExercisePreset, SyllablesSpecificConfig> = {
  easy: {
    syllablesCount: 3,
  },
  medium: {
    syllablesCount: 4,
  },
  hard: {
    syllablesCount: 5,
  },
  expert: {
    syllablesCount: 6,
  },
};