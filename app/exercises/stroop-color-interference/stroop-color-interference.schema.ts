import { z } from "zod";
import {
  baseExerciseConfigSchema,
  type ExercisePreset,
} from "@/lib/schemas/base-schemas";

// Lista de colores disponibles para el ejercicio
export const STROOP_COLORS = [
  { name: "Rojo", value: "#ef4444" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#22c55e" },
  { name: "Amarillo", value: "#eab308" },
  { name: "Naranja", value: "#f97316" },
  { name: "Morado", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Negro", value: "#18181b" },
];

// 1. Esquema de configuración específico para el ejercicio de Stroop
export const stroopColorInterferenceSpecificConfigSchema = z.object({
  numOptions: z.coerce
    .number()
    .min(2, "Debe haber al menos 2 opciones")
    .max(
      STROOP_COLORS.length,
      `No puede haber más de ${STROOP_COLORS.length} opciones`,
    )
    .int("El número de opciones debe ser un número entero"),
});

// 2. Esquema completo de configuración
export const configSchema = baseExerciseConfigSchema.merge(
  stroopColorInterferenceSpecificConfigSchema,
);

// 3. Esquema para los resultados de una pregunta individual
export const resultSchema = z.object({
  word: z.string(),
  color: z.string(),
  userAnswer: z.string(),
  isCorrect: z.boolean(),
  responseTime: z.number(),
});

// 5. Tipos derivados para uso en la aplicación
export type StroopColorInterferenceSpecificConfig = z.infer<
  typeof stroopColorInterferenceSpecificConfigSchema
>;
export type StroopColorInterferenceConfig = z.infer<typeof configSchema>;
export type StroopColorInterferenceQuestionResult = z.infer<
  typeof resultSchema
>;

export const presets: Record<
  ExercisePreset,
  StroopColorInterferenceSpecificConfig
> = {
  easy: {
    numOptions: 3,
  },
  medium: {
    numOptions: 4,
  },
  hard: {
    numOptions: 6,
  },
  expert: {
    numOptions: 8,
  },
};
