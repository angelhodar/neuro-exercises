import { z } from "zod";
import { baseExerciseConfigSchema } from "@/lib/schemas/base-schemas";

export const colorSequenceSpecificConfigSchema = z.object({
  highlightInterval: z.coerce
    .number()
    .min(200, "El intervalo de iluminación debe ser al menos 200ms")
    .max(5000, "El intervalo de iluminación debe ser como máximo 5 segundos"),
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
});

export function colorSequenceConfigRefinements(
  data: z.infer<typeof colorSequenceSpecificConfigSchema>,
  ctx: z.RefinementCtx
) {
  if (data.sequenceLength > data.numCells) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "La longitud de la secuencia no puede ser mayor que el número de celdas",
      path: ["sequenceLength"],
    });
  }
}

export const configSchema = baseExerciseConfigSchema
  .merge(colorSequenceSpecificConfigSchema)
  .superRefine(colorSequenceConfigRefinements);

export const defaultConfig: ColorSequenceConfig = {
  automaticNextQuestion: true,
  endConditionType: "questions",
  highlightInterval: 1200,
  numCells: 4,
  sequenceLength: 2,
  timeLimitSeconds: 0,
  totalQuestions: 5,
};

export const resultSchema = z.object({
  isCorrect: z.boolean(),
  targetSequence: z.array(z.number().int()),
  userSequence: z.array(z.number().int()),
});

export type ColorSequenceSpecificConfig = z.infer<
  typeof colorSequenceSpecificConfigSchema
>;
export type ColorSequenceConfig = z.infer<typeof configSchema>;
export type ColorSequenceQuestionResult = z.infer<typeof resultSchema>;
export type { BaseExerciseConfig } from "@/lib/schemas/base-schemas";
