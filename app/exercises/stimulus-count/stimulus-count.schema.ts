import { z } from "zod";
import {
  baseExerciseConfigSchema,
  type ExercisePreset,
} from "@/lib/schemas/base-schemas";

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
  allowOverlap: z.boolean({
    required_error: "Debe especificar si se permite solapamiento",
  }),
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
  shownStimuli: z.number().int(),
  userAnswer: z.number().int(),
  isCorrect: z.boolean(),
  timeSpent: z.number().int(), // ms
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
  shape: shapeSchema,
  color: z.string(),
});

export type Stimulus = z.infer<typeof stimulusSchema>;

export const stimulusCountPresets: Record<ExercisePreset, StimulusCountSpecificConfig> =
  {
    easy: { minStimuli: 3, maxStimuli: 5, allowOverlap: false },
    medium: { minStimuli: 5, maxStimuli: 10, allowOverlap: false },
    hard: { minStimuli: 10, maxStimuli: 20, allowOverlap: true },
    expert: { minStimuli: 15, maxStimuli: 30, allowOverlap: true },
  };

export const defaultConfig: StimulusCountConfig = {
  endConditionType: "questions",
  automaticNextQuestion: true,
  totalQuestions: 5,
  timeLimitSeconds: 0,
  ...stimulusCountPresets.easy,
};

export const configSchema = stimulusCountConfigSchema;
export const resultSchema = stimulusCountQuestionResultSchema;
export const presets = stimulusCountPresets;
