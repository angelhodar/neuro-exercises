import { expect } from "@playwright/test";
import { exerciseDisplayName } from "../fixtures/exercises";
import { test } from "../support/fixtures";

const TEMPLATES_URL = /\/dashboard\/templates$/;

test("save and restore an exercise preset after reload", async ({
  page,
  professional,
}) => {
  await page.goto("/exercises/stroop-color-interference/config");
  await page.getByLabel("Número de opciones", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Guardar actual" }).click();
  const name = `Preset ${professional.id}`;
  await page.getByPlaceholder("Nombre del preset").fill(name);
  await page.getByRole("button", { exact: true, name: "Guardar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await page.getByPlaceholder("Buscar configuración...").fill(name);
  await page.getByRole("option", { exact: true, name }).click();
  await expect(
    page.getByLabel("Número de opciones", { exact: true })
  ).toHaveValue("4");
});

test("create a template with two exercises and persist their configuration and order", async ({
  page,
  professional,
  testRun,
}) => {
  await page.goto("/dashboard/templates/create");
  const title = `Plantilla ${professional.id}`;
  await page.getByLabel("Título de la plantilla", { exact: true }).fill(title);
  await page
    .getByLabel("Descripción", { exact: true })
    .fill("Plantilla sintética de prueba");
  for (const slug of ["stroop-color-interference", "color-sequence"]) {
    // biome-ignore lint/performance/noAwaitInLoops: add ordered exercises through the real UI
    await page
      .getByRole("button", { exact: true, name: "Añadir ejercicio" })
      .click();
    await page
      .getByRole("dialog")
      .getByPlaceholder("Buscar ejercicio...")
      .fill(exerciseDisplayName(testRun.exercises, slug));
    await page
      .getByRole("dialog")
      .getByRole("button", { exact: true, name: "Añadir" })
      .click();
  }
  await page
    .getByRole("button", { exact: true, name: "Configurar" })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Número de opciones", { exact: true })
    .fill("4");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { exact: true, name: "Crear plantilla" })
    .click();
  await expect(page).toHaveURL(TEMPLATES_URL);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: title })).toContainText(
    "2 ejercicios"
  );
});
