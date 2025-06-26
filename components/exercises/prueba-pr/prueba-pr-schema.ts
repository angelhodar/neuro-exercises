import { z } from "zod";
import {
  baseExerciseConfigSchema,
  type ExercisePreset,
  type BaseExerciseConfig,
} from "@/lib/schemas/base-schemas";

export const COLORS = {
  Rojo: "text-red-500",
  Verde: "text-green-500",
  Azul: "text-blue-500",
  Amarillo: "text-yellow-500",
  Morado: "text-purple-500",
  Naranja: "text-orange-500",
} as const;

export type ColorName = keyof typeof COLORS;
export const colorNames = Object.keys(COLORS) as [ColorName, ...ColorName[]];

// 1. Esquema de configuración específico para el Test de Stroop
export const stroopTestSpecificConfigSchema = z.object({
  testMode: z
    .enum(["mixed", "congruent", "incongruent"], {
      required_error: "El modo de prueba es requerido",
      invalid_type_error: "Modo de prueba inválido",
    })
    .default("mixed"),
  incongruentRatio: z.coerce
    .number()
    .min(0, "La proporción debe ser al menos 0")
    .max(1, "La proporción debe ser como máximo 1")
    .default(0.5)
    .refine((val) => val >= 0 && val <= 1, {
      message: "La proporción de incongruencia debe estar entre 0 y 1",
    }),
});

// 2. Esquema completo de configuración
export const stroopTestConfigSchema = baseExerciseConfigSchema.merge(
  stroopTestSpecificConfigSchema,
);

// 3. Esquema de resultados de una pregunta
export const stroopTestQuestionResultSchema = z.object({
  wordText: z.string(), // The word displayed (e.g., "ROJO")
  wordColor: z.string(), // The ink color name (e.g., "Azul")
  isCongruent: z.boolean(),
  userAnswer: z.string(), // The color name selected by the user
  isCorrect: z.boolean(),
  timeSpent: z.number(), // Reaction time in milliseconds
});

// 4. Esquema de resultados generales del ejercicio
export const stroopTestExerciseResultsSchema = z.object({
  results: z.array(stroopTestQuestionResultSchema),
  config: stroopTestConfigSchema,
  completedAt: z.date(),
  accuracy: z.number().min(0).max(100),
  averageReactionTime: z.number().min(0), // For all correct answers
  averageCongruentTime: z.number().min(0), // For correct congruent answers
  averageIncongruentTime: z.number().min(0), // For correct incongruent answers
  stroopEffect: z.number(), // averageIncongruentTime - averageCongruentTime
});

// 5. Tipos derivados
export type StroopTestSpecificConfig = z.infer<
  typeof stroopTestSpecificConfigSchema
>;
export type StroopTestConfig = z.infer<typeof stroopTestConfigSchema>;
export type StroopTestQuestionResult = z.infer<
  typeof stroopTestQuestionResultSchema
>;
export type StroopTestExerciseResults = z.infer<
  typeof stroopTestExerciseResultsSchema
>;
export type { BaseExerciseConfig, ExercisePreset };

// 6. Configuración por defecto y presets
export const defaultStroopTestConfig: StroopTestConfig = {
  testMode: "mixed",
  incongruentRatio: 0.5,
  totalQuestions: 10,
};

export const stroopTestPresets: Record<ExercisePreset, StroopTestConfig> = {
  easy: {
    testMode: "mixed",
    incongruentRatio: 0.2,
    totalQuestions: 5,
  },
  medium: {
    testMode: "mixed",
    incongruentRatio: 0.5,
    totalQuestions: 10,
  },
  hard: {
    testMode: "mixed",
    incongruentRatio: 0.8,
    totalQuestions: 15,
  },
  expert: {
    testMode: "incongruent", // Mostly incongruent
    incongruentRatio: 1, // This value is ignored if testMode is not "mixed" but good to set for clarity
    totalQuestions: 20,
  },
};
