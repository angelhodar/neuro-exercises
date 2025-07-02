import { z, ZodTypeAny } from "zod";
import { getExerciseLinkByToken } from "@/app/actions/links";

// Esquemas más específicos que permiten discriminated unions
const configOnlySchema = z.object({
  config: z.string(),
  linkId: z.undefined().optional(),
  itemId: z.undefined().optional(),
}).transform(data => ({
  type: 'config' as const,
  config: data.config
}));

const linkOnlySchema = z.object({
  linkId: z.string(),
  itemId: z.string(),
  config: z.undefined().optional(),
}).transform(data => ({
  type: 'link' as const,
  linkId: data.linkId,
  itemId: data.itemId
}));

export const exerciseParamsSchema = z.union([
  configOnlySchema,
  linkOnlySchema
]);

export type ExerciseParams = z.infer<typeof exerciseParamsSchema>;

// Esquemas para la página de resultados - ahora mutuamente exclusivos
const configWithResultsSchema = z.object({
  config: z.string(),
  results: z.string(),
  rid: z.undefined().optional(),
}).transform(data => ({
  type: 'config' as const,
  config: data.config,
  results: data.results
}));

const resultIdSchema = z.object({
  rid: z.string().regex(/^\d+$/).transform(Number),
  config: z.undefined().optional(),
  results: z.undefined().optional(),
}).transform(data => ({
  type: 'result' as const,
  rid: data.rid
}));

export const exerciseResultsParamsSchema = z.union([
  configWithResultsSchema,
  resultIdSchema
]);

export type ExerciseResultsParams = z.infer<typeof exerciseResultsParamsSchema>;

export function parseConfigFromUrl(configString: string, schema: ZodTypeAny) {
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

export function parseResultsFromUrl(resultsString: string, resultsSchema: ZodTypeAny) {
  let parsedJson: unknown;
  
  try {
    parsedJson = JSON.parse(resultsString);
  } catch (error) {
    return null;
  }

  const results = z.array(resultsSchema).safeParse(parsedJson);

  if (!results.success) return null;

  return results.data;
}

// Función específica para obtener configuración del ejercicio desde un link
export async function getExerciseConfigFromLink(
  linkId: string,
  itemId: string
) {
  const linkData = await getExerciseLinkByToken(linkId);
  
  if (!linkData) return null;

  const numericItemId = parseInt(itemId);
  const item = linkData.template.exerciseTemplateItems.find(item => item.id === numericItemId);

  if (!item || !item.config) return null;

  return item.config;
}


