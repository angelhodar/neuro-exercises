import { z } from "zod";

export const baseExerciseConfigSchema = z.object({
  automaticNextQuestion: z.boolean().default(true),
  endConditionType: z
    .union([z.literal("questions"), z.literal("time")])
    .nullable(),
  timeLimitSeconds: z.coerce
    .number()
    .min(0)
    .int("El tiempo límite debe ser un número entero"),
  totalQuestions: z.coerce
    .number()
    .min(0)
    .max(100)
    .int("El total de preguntas debe ser un número entero"),
});

export type BaseExerciseConfig = z.infer<typeof baseExerciseConfigSchema>;
