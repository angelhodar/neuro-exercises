import { z } from "zod";

export const intrinsicGoalSchema = z.object({
  timeLimitSeconds: z.coerce
    .number()
    .min(1, "Debe ser al menos 1 segundo")
    .max(3600, "No puede ser más de 1 hora")
    .optional(),
  automaticNextQuestion: z.boolean().default(true)
});

export const explicitGoalSchema = z.object({
  endConditionType: z.union([z.literal("questions"), z.literal("time")]),
  totalQuestions: z.coerce
    .number()
    .min(1, "Debe tener al menos 1 pregunta")
    .max(100, "No puede tener más de 100 preguntas")
    .int("El total de preguntas debe ser un número entero"),
  timeLimitSeconds: z.number().min(0),
  automaticNextQuestion: z.boolean().default(true)
});

export type ExercisePreset = "easy" | "medium" | "hard" | "expert";

export type IntrinsicGoalExerciseConfig = z.infer<typeof intrinsicGoalSchema>;
export type ExplicitGoalExerciseConfig = z.infer<typeof explicitGoalSchema>;

export type BaseExerciseConfig =
  | IntrinsicGoalExerciseConfig
  | ExplicitGoalExerciseConfig;
