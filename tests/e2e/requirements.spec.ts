import { expect } from "@playwright/test";
import { test } from "../support/fixtures";
import { proposeBrief } from "../support/requirements";

const DRAFT_LINK = /Crear un ejercicio de atención con colores/;

test("clarify, revise, and resume a saved requirements draft", async ({
  page,
}) => {
  await proposeBrief(page);
  const draftUrl = page.url();
  let releaseResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  await page.route(
    "**/api/exercise-refinement",
    async (route) => {
      const response = await route.fetch();
      await responseGate;
      await route.fulfill({ response });
    },
    { times: 1 }
  );
  await page
    .getByLabel("Cambios en los requisitos")
    .fill("Aumentar a tres intentos");
  await page.getByLabel("Cambios en los requisitos").press("Enter");
  await expect(
    page.getByRole("button", { exact: true, name: "Crear ejercicio" })
  ).toBeDisabled();
  await expect(page.getByLabel("Cambios en los requisitos")).toBeDisabled();
  releaseResponse();
  await expect(page.getByText("Tres intentos", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { exact: true, name: "Crear ejercicio" })
  ).toBeEnabled();
  await page.reload();
  await expect(page.getByText("Tres intentos", { exact: true })).toBeVisible();
  await page.getByRole("link", { exact: true, name: "Mis borradores" }).click();
  await expect(page).toHaveURL(
    new URL("/dashboard/exercises/create", draftUrl).href
  );
  await expect(
    page.getByRole("heading", { name: "¿Qué ejercicio quieres crear?" })
  ).toBeVisible();
  await page.getByRole("link", { name: DRAFT_LINK }).click();
  await expect(page).toHaveURL(draftUrl);
  await expect(
    page.getByRole("button", { exact: true, name: "Crear ejercicio" })
  ).toBeEnabled();
});

test("an interrupted requirements request can be retried", async ({ page }) => {
  // This deliberately tests transport failure UX; successful turns still use the real server.
  await page.route(
    "**/api/exercise-refinement",
    (route) =>
      route.fulfill({ body: "Fallo de revisión de prueba", status: 500 }),
    { times: 1 }
  );
  await page.goto("/dashboard/exercises/create");
  await page
    .getByPlaceholder("Por ejemplo:", { exact: false })
    .fill("Crear un ejercicio de atención con colores.");
  await page.getByRole("button", { name: "Afinar idea" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "Reintentar" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { exact: true, name: "Crear ejercicio" })
  ).toHaveCount(0);
  await page.getByRole("button", { exact: true, name: "Reintentar" }).click();
  await expect(
    page.getByText("¿Cuántos intentos?", { exact: true })
  ).toBeVisible();
});
