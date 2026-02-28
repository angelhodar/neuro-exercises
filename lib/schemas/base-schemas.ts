import { z } from "zod";

export const baseExerciseConfigSchema = z.object({
  endConditionType: z
    .union([z.literal("questions"), z.literal("time")])
    .nullable(),
  totalQuestions: z.coerce
    .number()
    .min(0)
    .max(100)
    .int("El total de preguntas debe ser un número entero"),
  timeLimitSeconds: z.coerce
    .number()
    .min(0)
    .int("El tiempo límite debe ser un número entero"),
  automaticNextQuestion: z.boolean().default(true),
});

export type BaseExerciseConfig = z.infer<typeof baseExerciseConfigSchema>;
