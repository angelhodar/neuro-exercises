import type { ClientAssets } from "./assets";

// Only configuration components and schemas belong in the browser import graph.
// Exercise execution modules can contain server-only database operations.
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
      ConfigFieldsComponent: ConfigFields,
      configSchema,
      defaultConfig,
      resultSchema,
    };
  } catch (error) {
    console.error(`Failed to load client assets for slug: ${slug}`, error);
    return null;
  }
}
