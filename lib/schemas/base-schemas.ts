import { z } from "zod";

// Base exercise configuration
export const baseExerciseConfigSchema = z.object({
  totalQuestions: z.coerce
    .number()
    .min(1, "Debe tener al menos 1 pregunta")
    .max(100, "No puede tener más de 100 preguntas")
    .int("El total de preguntas debe ser un número entero"),
  timeLimitPerQuestion: z.coerce
    .number()
    .min(0, "No puede ser un numero negativo")
    .default(0)
    .optional(),
  timeIntervalBetweenQuestions: z.coerce
    .number()
    .min(0, "No puede ser un numero negativo")
    .default(0)
    .optional(),
  automaticNextQuestion: z.boolean().default(true).optional(),
});

// Exercise preset type
export type ExercisePreset = "easy" | "medium" | "hard" | "expert";

// Inferred types
export type BaseExerciseConfig = z.infer<typeof baseExerciseConfigSchema>;
