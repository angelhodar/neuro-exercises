import { z } from "zod";
import {
  explicitGoalSchema,
  type ExercisePreset,
} from "@/lib/schemas/base-schemas";

export const reactionTimeSpecificConfigSchema = z.object({
  gridSize: z.coerce
    .number()
    .min(3, "El tamaño de la cuadrícula debe ser al menos 3")
    .max(20, "El tamaño de la cuadrícula debe ser como máximo 20")
    .int("El tamaño de la cuadrícula debe ser un número entero"),
  delayMin: z.coerce
    .number()
    .min(100, "El retraso mínimo debe ser al menos 100ms")
    .max(10000, "El retraso mínimo debe ser como máximo 10 segundos"),
  delayMax: z.coerce
    .number()
    .min(200, "El retraso máximo debe ser al menos 200ms")
    .max(15000, "El retraso máximo debe ser como máximo 15 segundos"),
  cells: z.coerce
    .number()
    .min(1, "Debe tener al menos 1 celda objetivo")
    .int("El número de celdas debe ser un número entero"),
  cellDisplayDuration: z.coerce
    .number()
    .min(500, "La duración de visualización debe ser al menos 500ms")
    .max(
      10000,
      "La duración de visualización debe ser como máximo 10 segundos",
    ),
});

export function reactionTimeConfigRefinements(
  data: z.infer<typeof reactionTimeSpecificConfigSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.delayMax <= data.delayMin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El retraso máximo debe ser mayor que el retraso mínimo",
      path: ["delayMax"],
    });
  }

  if (data.cells > data.gridSize * data.gridSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "El número de celdas objetivo no puede exceder el total de celdas de la cuadrícula",
      path: ["cells"],
    });
  }
}

export const configSchema = explicitGoalSchema
  .merge(reactionTimeSpecificConfigSchema)
  .superRefine(reactionTimeConfigRefinements);

export const resultSchema = z.object({
  targetCells: z.array(z.number().int().min(0)),
  selectedCells: z.array(z.number().int().min(0)),
  reactionTimes: z.array(z.number().min(0)),
});

export type ReactionTimeSpecificConfig = z.infer<
  typeof reactionTimeSpecificConfigSchema
>;
export type ReactionTimeGridConfig = z.infer<typeof configSchema>;
export type ReactionTimeQuestionResult = z.infer<typeof resultSchema>;

export const presets: Record<ExercisePreset, ReactionTimeSpecificConfig> = {
  easy: {
    gridSize: 6,
    delayMin: 2000,
    delayMax: 4000,
    cells: 1,
    cellDisplayDuration: 3000,
  },
  medium: {
    gridSize: 10,
    delayMin: 1000,
    delayMax: 3000,
    cells: 1,
    cellDisplayDuration: 2000,
  },
  hard: {
    gridSize: 15,
    delayMin: 500,
    delayMax: 1500,
    cells: 2,
    cellDisplayDuration: 1500,
  },
  expert: {
    gridSize: 20,
    delayMin: 300,
    delayMax: 1000,
    cells: 3,
    cellDisplayDuration: 1000,
  },
};
