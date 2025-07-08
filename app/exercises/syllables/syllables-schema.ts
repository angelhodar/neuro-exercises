import { z } from "zod"
import { baseExerciseConfigSchema, type ExercisePreset } from "@/lib/schemas/base-schemas"
import { getWordsBySyllableCount, type SyllableCount } from "./spanish-words-dataset"

// Syllables specific configuration schema (in Spanish)
export const syllablesSpecificConfigSchema = z.object({
  syllablesCount: z.coerce
    .number()
    .min(3, "Mínimo 3 sílabas")
    .max(6, "Máximo 6 sílabas")
    .int("El número de sílabas debe ser un número entero")
})

// Reusable refinement function for syllables configurations
export function syllablesConfigRefinements(data: z.infer<typeof syllablesSpecificConfigSchema>, ctx: z.RefinementCtx) {
  // Validate that we have words available for the selected syllable count
  const availableWords = getWordsBySyllableCount(data.syllablesCount as SyllableCount)
  if (!availableWords || availableWords.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No hay palabras disponibles para ${data.syllablesCount} sílabas`,
      path: ["syllablesCount"],
    })
  }

  // Validate that we have enough words for the total questions
  if (availableWords && availableWords.length < 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No hay suficientes palabras disponibles para ${data.syllablesCount} sílabas (mínimo 5 necesarias)`,
      path: ["syllablesCount"],
    })
  }
}

// Complete syllables configuration schema
export const syllablesConfigSchema = baseExerciseConfigSchema
  .merge(syllablesSpecificConfigSchema)
  .superRefine(syllablesConfigRefinements)

// Updated question result schema - removed isCorrect and renamed reactionTime to timeSpent
export const syllablesQuestionResultSchema = z.object({
  targetWord: z.string(),
  targetSyllables: z.array(z.string()),
  selectedSyllables: z.array(z.string()),
  timeSpent: z.number().min(0),
  timeExpired: z.boolean(),
})

// Exercise results schema
export const syllablesExerciseResultsSchema = z.object({
  results: z.array(syllablesQuestionResultSchema),
  config: syllablesConfigSchema,
  completedAt: z.date(),
  totalCorrect: z.number().int().min(0),
  totalQuestions: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  averageTimeSpent: z.number().min(0),
})

// Inferred types
export type SyllablesSpecificConfig = z.infer<typeof syllablesSpecificConfigSchema>
export type SyllablesConfig = z.infer<typeof syllablesConfigSchema>
export type SyllablesQuestionResult = z.infer<typeof syllablesQuestionResultSchema>
export type SyllablesExerciseResults = z.infer<typeof syllablesExerciseResultsSchema>

// Default configuration
export const defaultSyllablesConfig: SyllablesConfig = {
  syllablesCount: 4,
  totalQuestions: 10,
}

// Preset configurations (in Spanish)
export const syllablesPresets: Record<ExercisePreset, SyllablesConfig> = {
  easy: {
    syllablesCount: 3,
    totalQuestions: 5,
  },
  medium: {
    syllablesCount: 4,
    totalQuestions: 10,
  },
  hard: {
    syllablesCount: 5,
    totalQuestions: 15,
  },
  expert: {
    syllablesCount: 6,
    totalQuestions: 20,
  },
}
