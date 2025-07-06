import { z } from "zod"
import { baseExerciseConfigSchema, type ExercisePreset, type BaseExerciseConfig } from "@/lib/schemas/base-schemas"

// 1. Esquema de configuración específico para la secuencia de colores
export const colorSequenceSpecificConfigSchema = z.object({
  numCells: z.coerce
    .number()
    .min(2, "Debe haber al menos 2 celdas")
    .max(12, "No puede tener más de 12 celdas")
    .int("El número de celdas debe ser un número entero"),
  sequenceLength: z.coerce
    .number()
    .min(1, "La longitud de la secuencia debe ser al menos 1")
    .max(12, "La longitud de la secuencia no puede superar 12")
    .int("La longitud de la secuencia debe ser un número entero"),
  highlightInterval: z.coerce
    .number()
    .min(200, "El intervalo de iluminación debe ser al menos 200ms")
    .max(5000, "El intervalo de iluminación debe ser como máximo 5 segundos"),
})

// 2. Refinamientos adicionales
export function colorSequenceConfigRefinements(
  data: z.infer<typeof colorSequenceSpecificConfigSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.sequenceLength > data.numCells) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La longitud de la secuencia no puede ser mayor que el número de celdas",
      path: ["sequenceLength"],
    })
  }
}

// 3. Esquema completo de configuración
export const colorSequenceConfigSchema = baseExerciseConfigSchema
  .merge(colorSequenceSpecificConfigSchema)
  .superRefine(colorSequenceConfigRefinements)

// 4. Resultados
export const colorSequenceQuestionResultSchema = z.object({
  targetSequence: z.array(z.number().int()),
  userSequence: z.array(z.number().int()),
  isCorrect: z.boolean(),
})

export const colorSequenceExerciseResultsSchema = z.object({
  results: z.array(colorSequenceQuestionResultSchema),
  config: colorSequenceConfigSchema,
  completedAt: z.date(),
  totalCorrect: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
})

// 5. Tipos derivados
export type ColorSequenceSpecificConfig = z.infer<typeof colorSequenceSpecificConfigSchema>
export type ColorSequenceConfig = z.infer<typeof colorSequenceConfigSchema>
export type ColorSequenceQuestionResult = z.infer<typeof colorSequenceQuestionResultSchema>
export type ColorSequenceExerciseResults = z.infer<typeof colorSequenceExerciseResultsSchema>
export type { BaseExerciseConfig, ExercisePreset }

// 6. Configuración por defecto y presets
export const defaultColorSequenceConfig: ColorSequenceConfig = {
  numCells: 6,
  sequenceLength: 3,
  highlightInterval: 1000,
  totalQuestions: 10,
}

export const colorSequencePresets: Record<ExercisePreset, ColorSequenceConfig> = {
  easy: {
    numCells: 4,
    sequenceLength: 2,
    highlightInterval: 1200,
    totalQuestions: 5,
  },
  medium: {
    numCells: 6,
    sequenceLength: 3,
    highlightInterval: 1000,
    totalQuestions: 10,
  },
  hard: {
    numCells: 8,
    sequenceLength: 4,
    highlightInterval: 800,
    totalQuestions: 15,
  },
  expert: {
    numCells: 12,
    sequenceLength: 6,
    highlightInterval: 600,
    totalQuestions: 20,
  },
} 