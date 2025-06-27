import type { SearchParams } from "nuqs/server";
import { getExerciseFromServerRegistry } from "@/app/registry/registry.server";

export function parseConfigFromSearchParams(
  slug: string,
  searchParams: SearchParams
) {
  const configString = searchParams.config;

  if (!configString || Array.isArray(configString)) return null;

  const exerciseDetails = getExerciseFromServerRegistry(slug);

  if (!exerciseDetails) return null;

  const { schema } = exerciseDetails;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(configString || "{}");
  } catch (error) {
    return null;
  }

  const config = schema.safeParse(parsedJson);

  if (!config.success) return null;

  return config.data;
}

export function parseResultsFromSearchParams(
  slug: string,
  searchParams: SearchParams
) {
  const resultsString = searchParams.results;

  if (!resultsString || Array.isArray(resultsString)) return null;

  /*const exerciseDetails = getExerciseFromServerRegistry(slug);

  if (!exerciseDetails) return null;

  const { schema } = exerciseDetails;*/

  let parsedJson: unknown;
  
  try {
    parsedJson = JSON.parse(resultsString || "{}");
  } catch (error) {
    return null;
  }

  return parsedJson;

  /*const results = schema.safeParse(parsedJson);

  if (!results.success) return null;

  return results.data;*/
}
