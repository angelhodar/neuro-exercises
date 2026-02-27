import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { exerciseHasAssets } from "./loader";

const EXERCISES_DIR = join(process.cwd(), "app/exercises");
const IGNORED_DIRS = new Set(["[slug]"]);

function getExerciseDirectories(): string[] {
  return readdirSync(EXERCISES_DIR).filter((entry) => {
    if (
      IGNORED_DIRS.has(entry) ||
      entry.startsWith(".") ||
      entry.endsWith(".ts") ||
      entry.endsWith(".tsx")
    ) {
      return false;
    }
    const fullPath = join(EXERCISES_DIR, entry);
    return statSync(fullPath).isDirectory();
  });
}

export async function getImplementedExerciseSlugs(): Promise<string[]> {
  const dirs = getExerciseDirectories();
  const checks = await Promise.all(
    dirs.map(async (slug) => ({
      slug,
      hasAssets: await exerciseHasAssets(slug),
    }))
  );
  return checks.filter((c) => c.hasAssets).map((c) => c.slug);
}
