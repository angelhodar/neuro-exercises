import { z } from "zod";
import { baseExerciseConfigSchema } from "@/lib/schemas/base-schemas";

const stimulusCountRangeSchema = z.object({
  allowOverlap: z.boolean({
    error: "Debe especificar si se permite solapamiento",
  }),
  maxStimuli: z.coerce
    .number()
    .min(1, "Debe haber al menos 1 estímulo")
    .max(50, "No puede haber más de 50 estímulos")
    .int("El máximo debe ser un número entero"),
  minStimuli: z.coerce
    .number()
    .min(1, "Debe haber al menos 1 estímulo")
    .max(50, "No puede haber más de 50 estímulos")
    .int("El mínimo debe ser un número entero"),
});

export const stimulusCountConfigSchema = baseExerciseConfigSchema
  .merge(stimulusCountRangeSchema)
  .superRefine((data, ctx) => {
    if (data.maxStimuli < data.minStimuli) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El máximo debe ser mayor o igual al mínimo",
        path: ["maxStimuli"],
      });
    }
  });

export const stimulusCountSpecificConfigSchema = stimulusCountRangeSchema;

export const stimulusCountQuestionResultSchema = z.object({
  isCorrect: z.boolean(),
  shownStimuli: z.number().int(),
  timeSpent: z.number().int(), // ms
  userAnswer: z.number().int(),
});

export type StimulusCountSpecificConfig = z.infer<
  typeof stimulusCountSpecificConfigSchema
>;
export type StimulusCountConfig = z.infer<typeof stimulusCountConfigSchema>;
export type StimulusCountQuestionResult = z.infer<
  typeof stimulusCountQuestionResultSchema
>;

export const shapeSchema = z.enum(["star", "circle", "square", "triangle"]);
export type Shape = z.infer<typeof shapeSchema>;

export const stimulusSchema = z.object({
  color: z.string(),
  shape: shapeSchema,
});

export type Stimulus = z.infer<typeof stimulusSchema>;

export const defaultConfig: StimulusCountConfig = {
  allowOverlap: false,
  automaticNextQuestion: true,
  endConditionType: "questions",
  maxStimuli: 5,
  minStimuli: 3,
  timeLimitSeconds: 0,
  totalQuestions: 5,
};

export const configSchema = stimulusCountConfigSchema;
export const resultSchema = stimulusCountQuestionResultSchema;
