import type { ComponentType } from "react";
import type { z } from "zod";

export interface ExerciseAssets {
  configSchema: z.ZodType<Record<string, unknown>, Record<string, unknown>>;
  resultSchema: z.ZodType<Record<string, unknown>, Record<string, unknown>>;
  defaultConfig: Record<string, unknown>;
  ExerciseComponent: ComponentType<{ config: Record<string, unknown> }>;
  ResultsComponent: ComponentType<Record<string, unknown>>;
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>;
}

export type ClientAssets = Omit<
  ExerciseAssets,
  "ExerciseComponent" | "ResultsComponent"
>;

export async function loadExerciseAssets(
  slug: string
): Promise<ExerciseAssets | null> {
  try {
    const [
      { Exercise },
      { Results },
      { ConfigFields },
      { configSchema, resultSchema, defaultConfig },
    ] = await Promise.all([
      import(`./${slug}/${slug}.exercise`),
      import(`./${slug}/${slug}.results`),
      import(`./${slug}/${slug}.config`),
      import(`./${slug}/${slug}.schema`),
    ]);

    return {
      configSchema,
      resultSchema,
      defaultConfig,
      ExerciseComponent: Exercise,
      ResultsComponent: Results,
      ConfigFieldsComponent: ConfigFields,
    };
  } catch (error) {
    console.error(`Failed to load exercise assets for slug: ${slug}`, error);
    return null;
  }
}

export async function loadClientAssets(
  slug: string
): Promise<ClientAssets | null> {
  try {
    const [{ ConfigFields }, { configSchema, resultSchema, defaultConfig }] =
      await Promise.all([
        import(`./${slug}/${slug}.config`),
        import(`./${slug}/${slug}.schema`),
      ]);

    return {
      configSchema,
      resultSchema,
      defaultConfig,
      ConfigFieldsComponent: ConfigFields,
    };
  } catch (error) {
    console.error(`Failed to load client assets for slug: ${slug}`, error);
    return null;
  }
}

export async function exerciseHasAssets(slug: string): Promise<boolean> {
  try {
    await import(`./${slug}/${slug}.schema`);
    return true;
  } catch (_error) {
    return false;
  }
}
