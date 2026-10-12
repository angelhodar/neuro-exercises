import type { ComponentType } from "react";
import type { z } from "zod";

export interface ClientAssets {
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>;
  configSchema: z.ZodType<Record<string, unknown>, Record<string, unknown>>;
  defaultConfig: Record<string, unknown>;
  resultSchema: z.ZodType<Record<string, unknown>, Record<string, unknown>>;
}

export interface ExerciseAssets extends ClientAssets {
  ExerciseComponent: ComponentType<{ config: Record<string, unknown> }>;
  ResultsComponent: ComponentType<Record<string, unknown>>;
}
