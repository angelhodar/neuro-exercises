import { z } from "zod";

export const baseExerciseConfigSchema = z.object({
  endConditionType: z.enum(["questions", "time"]).default("questions").nullish(),
  totalQuestions: z.coerce
    .number()
    .min(1, "Debe tener al menos 1 pregunta")
    .max(100, "No puede tener más de 100 preguntas")
    .int("El total de preguntas debe ser un número entero")
    .optional(),
  timeLimitSeconds: z.coerce
    .number()
    .min(1, "Debe ser al menos 1 segundo")
    .max(3600, "No puede ser más de 1 hora")
    .optional(),
  automaticNextQuestion: z.boolean().default(true).optional(),
});

// Exercise preset type
export type ExercisePreset = "easy" | "medium" | "hard" | "expert";

// Inferred types
export type BaseExerciseConfig = z.infer<typeof baseExerciseConfigSchema>;
