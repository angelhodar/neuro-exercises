import { z } from "zod";

const conciseText = z.string().trim().min(1).max(2000);

export const askUserQuestionOptionSchema = z.object({
  description: z
    .string()
    .trim()
    .max(240)
    .optional()
    .describe("Optional one-line explanation shown under the label"),
  label: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .describe('Short answer label, for example "Palabras" or "Con tiempo"'),
});

export const askUserQuestionInputSchema = z
  .object({
    multiSelect: z
      .boolean()
      .optional()
      .describe("Set true when several options can apply at once"),
    options: z
      .array(askUserQuestionOptionSchema)
      .min(2)
      .max(4)
      .optional()
      .describe(
        "Two to four useful choices when the answer set is enumerable. Omit for open questions."
      ),
    question: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .describe(
        "The single question to ask, in the professional's language. Never bundle multiple questions."
      ),
  })
  .superRefine((input, context) => {
    const labels = input.options?.map((option) => option.label);
    if (labels && new Set(labels).size !== labels.length) {
      context.addIssue({
        code: "custom",
        message: "Las opciones deben tener etiquetas diferentes",
        path: ["options"],
      });
    }
  });

export const askUserQuestionOutputSchema = z.object({
  freeText: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .describe("Free-text detail supplied alongside or instead of a choice"),
  selected: z
    .array(z.string().trim().min(1).max(80))
    .max(4)
    .describe("Labels of the selected options"),
});

export const exerciseBriefSchema = z.object({
  accessibilityConsiderations: z
    .array(conciseText)
    .max(8)
    .describe("Motor, visual, auditory, language, or usability considerations"),
  completionCriteria: conciseText.describe(
    "How a session or round ends, including timing or number of trials"
  ),
  configurableParameters: z
    .array(conciseText)
    .max(10)
    .describe("Controls the professional should be able to configure"),
  difficultyAndProgression: conciseText.describe(
    "How difficulty is defined and whether it changes during the exercise"
  ),
  feedback: conciseText.describe(
    "Feedback shown during and after the exercise"
  ),
  resultsToRecord: z
    .array(conciseText)
    .min(1)
    .max(10)
    .describe("Measures that should appear in the final results"),
  stimuli: z
    .array(conciseText)
    .min(1)
    .max(8)
    .describe("Content or media presented to the patient"),
  summary: conciseText.describe(
    "A concise, implementation-focused overview of the agreed exercise"
  ),
  taskFlow: z
    .array(conciseText)
    .min(2)
    .max(10)
    .describe("Ordered description of what happens during the exercise"),
});

export const proposeExerciseBriefInputSchema = z.object({
  brief: exerciseBriefSchema,
});

export const proposeExerciseBriefOutputSchema = z
  .object({
    accepted: z.boolean(),
    feedback: z.string().trim().max(2000).optional(),
  })
  .superRefine((answer, context) => {
    if (!(answer.accepted || answer.feedback)) {
      context.addIssue({
        code: "custom",
        message: "Explica qué quieres ajustar",
        path: ["feedback"],
      });
    }
  });

export type AskUserQuestionInput = z.infer<typeof askUserQuestionInputSchema>;
export type AskUserQuestionOutput = z.infer<typeof askUserQuestionOutputSchema>;
export type ExerciseBrief = z.infer<typeof exerciseBriefSchema>;
export type ProposeExerciseBriefOutput = z.infer<
  typeof proposeExerciseBriefOutputSchema
>;
