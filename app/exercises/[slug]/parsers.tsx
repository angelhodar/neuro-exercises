import { z } from "zod";
import { getExerciseLinkByToken } from "@/app/actions/links";
import type { Exercise } from "@/lib/db/schema";

// Esquemas más específicos que permiten discriminated unions
const configOnlySchema = z
  .object({
    config: z.string(),
    itemId: z.undefined().optional(),
    linkId: z.undefined().optional(),
  })
  .transform((data) => ({
    config: data.config,
    type: "config" as const,
  }));

const linkOnlySchema = z
  .object({
    config: z.undefined().optional(),
    itemId: z.string(),
    linkId: z.string(),
  })
  .transform((data) => ({
    itemId: data.itemId,
    linkId: data.linkId,
    type: "link" as const,
  }));

export const exerciseParamsSchema = z.union([configOnlySchema, linkOnlySchema]);

export type ExerciseParams = z.infer<typeof exerciseParamsSchema>;

// Esquemas para la página de resultados - ahora mutuamente exclusivos
const configWithResultsSchema = z
  .object({
    config: z.string(),
    results: z.string(),
    rid: z.undefined().optional(),
  })
  .transform((data) => ({
    config: data.config,
    results: data.results,
    type: "config" as const,
  }));

const resultIdSchema = z
  .object({
    config: z.undefined().optional(),
    results: z.undefined().optional(),
    rid: z.string().regex(/^\d+$/).transform(Number),
  })
  .transform((data) => ({
    rid: data.rid,
    type: "result" as const,
  }));

export const exerciseResultsParamsSchema = z.union([
  configWithResultsSchema,
  resultIdSchema,
]);

export type ExerciseResultsParams = z.infer<typeof exerciseResultsParamsSchema>;

export function parseConfigFromUrl(
  configString: string,
  schema: z.ZodType<Record<string, unknown>>
) {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(configString);
  } catch {
    return null;
  }

  const config = schema.safeParse(parsedJson);

  if (!config.success) {
    return null;
  }

  return config.data;
}

export function parseResultsFromUrl(
  resultsString: string,
  resultsSchema: z.ZodType<Record<string, unknown>>
) {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(resultsString);
  } catch {
    return null;
  }

  const results = z
    .array(resultsSchema)
    .min(1, "Debe haber al menos un resultado")
    .safeParse(parsedJson);

  if (!results.success) {
    return null;
  }

  return results.data;
}

export async function getExerciseConfigFromLink(
  linkId: string,
  itemId: string
) {
  const linkData = await getExerciseLinkByToken(linkId);

  if (!linkData) {
    return null;
  }

  const numericItemId = Number.parseInt(itemId, 10);
  const item = linkData.template.exerciseTemplateItems.find(
    (templateItem) => templateItem.id === numericItemId
  );

  if (!item?.config) {
    return null;
  }

  return item.config;
}

export function getExerciseFromSandboxEnv() {
  return JSON.parse(process.env.SANDBOX_EXERCISE ?? "{}") as Exercise;
}
