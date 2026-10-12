import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function proposeBrief(page: Page) {
  await page.goto("/dashboard/exercises/create");
  await page
    .getByPlaceholder("Por ejemplo:", { exact: false })
    .fill("Crear un ejercicio de atención con colores y dos intentos.");
  await page.getByRole("button", { name: "Afinar idea" }).click();
  await expect(
    page.getByText("¿Cuántos intentos?", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { exact: true, name: "Crear ejercicio" })
  ).toBeDisabled();
  await page.getByRole("radio", { exact: true, name: "Dos" }).check();
  await page.getByRole("button", { exact: true, name: "Continuar" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "Crear ejercicio" })
  ).toBeEnabled();
}
