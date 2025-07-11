import { z } from "zod"
import { baseExerciseConfigSchema, type ExercisePreset, type BaseExerciseConfig } from "@/lib/schemas/base-schemas"

// 1. Esquema de configuración específico para el ejercicio de conteo de estímulos
const stimulusCountRangeSchema = z.object({
  minStimuli: z.coerce
    .number()
    .min(1, "Debe haber al menos 1 estímulo")
    .max(50, "No puede haber más de 50 estímulos")
    .int("El mínimo debe ser un número entero"),
  maxStimuli: z.coerce
    .number()
    .min(1, "Debe haber al menos 1 estímulo")
    .max(50, "No puede haber más de 50 estímulos")
    .int("El máximo debe ser un número entero"),
  allowOverlap: z.boolean({ required_error: "Debe especificar si se permite solapamiento" }),
})

export const stimulusCountConfigSchema = baseExerciseConfigSchema
  .merge(stimulusCountRangeSchema)
  .superRefine((data, ctx) => {
    if (data.maxStimuli < data.minStimuli) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El máximo debe ser mayor o igual al mínimo",
        path: ["maxStimuli"],
      })
    }
  })

export const stimulusCountSpecificConfigSchema = stimulusCountRangeSchema

// 2. Resultados
export const stimulusCountQuestionResultSchema = z.object({
  shownStimuli: z.number().int(),
  userAnswer: z.number().int(),
  isCorrect: z.boolean(),
  timeSpent: z.number().int(), // tiempo en ms
})

export const stimulusCountExerciseResultsSchema = z.object({
  results: z.array(stimulusCountQuestionResultSchema),
  config: stimulusCountConfigSchema,
  completedAt: z.date(),
  totalCorrect: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
})

// 3. Tipos derivados
export type StimulusCountSpecificConfig = z.infer<typeof stimulusCountSpecificConfigSchema>
export type StimulusCountConfig = z.infer<typeof stimulusCountConfigSchema>
export type StimulusCountQuestionResult = z.infer<typeof stimulusCountQuestionResultSchema>
export type StimulusCountExerciseResults = z.infer<typeof stimulusCountExerciseResultsSchema>
export type { BaseExerciseConfig, ExercisePreset }

// 4. Tipos adicionales para el ejercicio
export const shapeSchema = z.enum(["star", "circle", "square", "triangle"])
export type Shape = z.infer<typeof shapeSchema>

export const stimulusSchema = z.object({
  shape: shapeSchema,
  color: z.string(),
})
export type Stimulus = z.infer<typeof stimulusSchema>

// 5. Configuraciones por defecto y presets
export const defaultStimulusCountConfig: StimulusCountConfig = {
  minStimuli: 5,
  maxStimuli: 10,
  allowOverlap: false,
  totalQuestions: 10,
}

export const stimulusCountPresets: Record<ExercisePreset, StimulusCountConfig> = {
  easy: { minStimuli: 3, maxStimuli: 5, allowOverlap: false, totalQuestions: 5 },
  medium: { minStimuli: 5, maxStimuli: 10, allowOverlap: false, totalQuestions: 10 },
  hard: { minStimuli: 10, maxStimuli: 20, allowOverlap: true, totalQuestions: 15 },
  expert: { minStimuli: 15, maxStimuli: 30, allowOverlap: true, totalQuestions: 20 },
}

// Exports required by the loader
export const configSchema = stimulusCountConfigSchema;
export const resultSchema = stimulusCountExerciseResultsSchema;
export const presets = stimulusCountPresets; 