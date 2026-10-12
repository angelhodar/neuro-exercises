import "server-only";

import type { ExerciseAssets } from "./assets";

export type { ClientAssets, ExerciseAssets } from "./assets";

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
      ConfigFieldsComponent: ConfigFields,
      configSchema,
      defaultConfig,
      ExerciseComponent: Exercise,
      ResultsComponent: Results,
      resultSchema,
    };
  } catch (error) {
    console.error(`Failed to load exercise assets for slug: ${slug}`, error);
    return null;
  }
}

export async function exerciseHasAssets(slug: string): Promise<boolean> {
  try {
    await import(`./${slug}/${slug}.schema`);
    return true;
  } catch {
    return false;
  }
}
