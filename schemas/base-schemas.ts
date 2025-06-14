import { z } from "zod"

// Base exercise configuration schema with Spanish validation messages
export const baseExerciseConfigSchema = z.object({
  totalQuestions: z.coerce
    .number()
    .min(1, "Debe tener al menos 1 pregunta")
    .max(100, "No puede tener más de 100 preguntas")
    .int("El total de preguntas debe ser un número entero"),
})

// Exercise preset type
export type ExercisePreset = "easy" | "medium" | "hard" | "expert"

// Inferred types
export type BaseExerciseConfig = z.infer<typeof baseExerciseConfigSchema>
