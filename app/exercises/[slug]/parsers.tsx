import type { SearchParams } from "nuqs/server";
import { notFound } from "next/navigation";
import { z, ZodTypeAny } from "zod";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { getExerciseLinkByPublicId } from "@/app/actions/links";

// Esquema para validar que tenemos o config o (linkId + itemId)
export const exerciseParamsSchema = z.union([
  z.object({
    config: z.string(),
    linkId: z.undefined().optional(),
    itemId: z.undefined().optional(),
  }),
  z.object({
    linkId: z.string(),
    itemId: z.string(),
    config: z.undefined().optional(),
  })
]);

// Esquema para la página de resultados que extiende exerciseParamsSchema
export const exerciseResultsParamsSchema = z.union([
  z.object({
    config: z.string(),
    results: z.string(),
    linkId: z.undefined().optional(),
    itemId: z.undefined().optional(),
  }),
  z.object({
    linkId: z.string(),
    itemId: z.string(),
    config: z.undefined().optional(),
    results: z.undefined().optional(),
  })
]);

export function parseConfigFromSearchParams(
  slug: string,
  searchParams: SearchParams
) {
  const configString = searchParams.config;

  if (!configString || Array.isArray(configString)) return null;

  const entry = getExerciseFromRegistry(slug);

  if (!entry) return null;

  const { schema } = entry;

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

// Nueva API: parseConfigFromUrl recibe configString y schema directamente
export async function parseConfigFromUrl(configString: string, schema: ZodTypeAny) {
  let parsedJson: unknown;
  
  try {
    parsedJson = JSON.parse(configString);
  } catch (error) {
    return null;
  }

  const config = schema.safeParse(parsedJson);

  if (!config.success) return null;

  return config.data;
}

// Nueva API: parseResultsFromUrl recibe resultsString directamente
export async function parseResultsFromUrl(resultsString: string) {
  let parsedJson: unknown;
  
  try {
    parsedJson = JSON.parse(resultsString);
  } catch (error) {
    return null;
  }

  return parsedJson;
}

// Función específica para obtener configuración del ejercicio desde un link
export async function getExerciseConfigFromLink(
  linkId: string,
  itemId: string
) {
  const linkData = await getExerciseLinkByPublicId(linkId);
  
  if (!linkData) return null;

  const numericItemId = parseInt(itemId);
  const item = linkData.template.exerciseTemplateItems.find(item => item.id === numericItemId);

  if (!item || !item.config) return null;

  return item.config;
}

// Función específica para obtener resultados del ejercicio desde un link
export async function getExerciseResultsFromLink(
  linkId: string,
  itemId: string
) {
  const linkData = await getExerciseLinkByPublicId(linkId);
  
  if (!linkData) return null;

  const numericItemId = parseInt(itemId);
  const item = linkData.template.exerciseTemplateItems.find(item => item.id === numericItemId);

  if (!item) return null;

  // Obtener los resultados más recientes del ejercicio
  const exerciseResults = item.exerciseResults?.[0];
  if (!exerciseResults) return null;

  return {
    config: item.config,
    results: exerciseResults.results,
    backUrl: `/s/${linkId}`
  };
}


