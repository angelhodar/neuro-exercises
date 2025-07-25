import type { ComponentType } from "react";
import type { ZodTypeAny } from "zod";

export type ExerciseAssets = {
  configSchema: ZodTypeAny;
  resultSchema: ZodTypeAny;
  presets?: Record<string, Record<string, any>>;
  defaultConfig: Record<string, any>;
  ExerciseComponent: ComponentType<{ config: any }>;
  ResultsComponent: ComponentType<any>;
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>;
};

export type ClientAssets = Omit<ExerciseAssets, "ExerciseComponent" | "ResultsComponent">;

export async function loadExerciseAssets(
  slug: string,
): Promise<ExerciseAssets | null> {
  try {
    const [
      { Exercise },
      { Results },
      { ConfigFields },
      { configSchema, resultSchema, defaultConfig, presets },
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
      presets,
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
  slug: string,
): Promise<ClientAssets | null> {
  try {
    const [
      { ConfigFields },
      { configSchema, resultSchema, defaultConfig, presets },
    ] = await Promise.all([
      import(`./${slug}/${slug}.config`),
      import(`./${slug}/${slug}.schema`),
    ]);

    return {
      configSchema,
      resultSchema,
      presets,
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
  } catch (error) {
    return false;
  }
}


