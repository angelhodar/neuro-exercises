import { expect } from "@playwright/test";
import { exerciseDisplayName, exerciseSlugs } from "../fixtures/exercises";
import { publicTest as test } from "../support/fixtures";

const COLOR_WORD = /^(Rojo|Azul|Verde|Amarillo|Naranja|Morado|Rosa|Negro)$/;
const RESULTS_URL = /\/results\?/;
const CONFIG_URL = /\/stroop-color-interference\/config$/;

for (const slug of exerciseSlugs) {
  test(`loads browser-safe configuration for ${slug}`, async ({
    page,
    testRun,
  }) => {
    await page.goto(`/exercises/${slug}/config`);
    await expect(
      page.getByText(exerciseDisplayName(testRun.exercises, slug), {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { exact: true, name: "Comenzar" })
    ).toBeVisible();
    await expect(
      page.getByText("Error loading exercise configuration")
    ).toHaveCount(0);
  });
}

test("validate configuration, execute Stroop, and display results", async ({
  page,
}) => {
  await page.goto("/exercises/stroop-color-interference/config");
  await page.getByLabel("Número de ensayos", { exact: true }).fill("1");
  await page.getByLabel("Número de opciones", { exact: true }).fill("1");
  await page.getByRole("button", { exact: true, name: "Comenzar" }).click();
  await expect(page.getByText("Debe haber al menos 2 opciones")).toBeVisible();
  await page.getByLabel("Número de opciones", { exact: true }).fill("2");
  await page.getByRole("button", { exact: true, name: "Comenzar" }).click();
  await page.getByRole("button", { exact: true, name: "Empezar" }).click();
  const colors: Record<string, string> = {
    "rgb(24, 24, 27)": "Negro",
    "rgb(34, 197, 94)": "Verde",
    "rgb(59, 130, 246)": "Azul",
    "rgb(139, 92, 246)": "Morado",
    "rgb(234, 179, 8)": "Amarillo",
    "rgb(236, 72, 153)": "Rosa",
    "rgb(239, 68, 68)": "Rojo",
    "rgb(249, 115, 22)": "Naranja",
  };
  const stimulus = page.getByRole("heading", { level: 1 }).filter({
    hasText: COLOR_WORD,
  });
  await expect(stimulus).toBeVisible();
  const color = await stimulus.evaluate(
    (element) => getComputedStyle(element).color
  );
  await page.getByRole("button", { exact: true, name: colors[color] }).click();
  await expect(page).toHaveURL(RESULTS_URL);
  await expect(
    page.getByText("Resultados: Stroop", { exact: true })
  ).toBeVisible();
  await expect(page.getByText("100.0%", { exact: true })).toBeVisible();
  await expect(page.getByText("1/1", { exact: true })).toBeVisible();
});

test("missing and invalid runtime configuration return to configuration", async ({
  page,
}) => {
  for (const suffix of ["", "?config=invalid", "?config=%7B%7D"]) {
    // biome-ignore lint/performance/noAwaitInLoops: test redirects sequentially in the same browser
    await page.goto(`/exercises/stroop-color-interference${suffix}`);
    await expect(page).toHaveURL(CONFIG_URL);
  }
});
