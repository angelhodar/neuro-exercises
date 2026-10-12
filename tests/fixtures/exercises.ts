import { smokeExerciseSlugs } from "../../lib/e2e/fixtures";

export const exerciseSlugs = smokeExerciseSlugs;

export function exerciseName(slug: string) {
  return `Test ${slug}`;
}

export function exerciseDisplayName(
  catalog: { displayName: string; slug: string }[],
  slug: string
) {
  const exercise = catalog.find((entry) => entry.slug === slug);
  if (!exercise) {
    throw new Error(`Missing exercise fixture: ${slug}`);
  }
  return exercise.displayName;
}
