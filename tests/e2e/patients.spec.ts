import { expect } from "@playwright/test";
import { test } from "../support/fixtures";
import { deploymentHeaders } from "../support/preview-environment";
import { signInUser } from "../support/sign-in";

const SAVE_BUTTON = /Guardar/;
const NEW_TEST_BUTTON = /Nuevo test/i;
const PATIENT_URL = /\/dashboard\/patients\/\d+$/;

test("patient, session, and assessment persist and remain private to their creator", async ({
  page,
  professional,
  browser,
  testRun,
}) => {
  await page.goto("/dashboard/patients");
  await page
    .getByRole("button", { exact: true, name: "Crear paciente" })
    .first()
    .click();
  const name = `Paciente ${professional.id}`;
  await page
    .getByRole("dialog")
    .getByLabel("Nombre *", { exact: true })
    .fill(name);
  await page
    .getByRole("dialog")
    .getByLabel("Apellidos *", { exact: true })
    .fill("Sintético");
  await page
    .getByRole("dialog")
    .getByRole("button", { exact: true, name: "Crear paciente" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("row")
    .filter({ hasText: name })
    .getByRole("button", {
      exact: true,
      name: `Ver paciente ${name} Sintético`,
    })
    .click();
  await expect(page).toHaveURL(PATIENT_URL);
  const patientUrl = page.url();
  await page
    .getByRole("button", { exact: true, name: "Nueva sesión" })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tipo de sesión *", { exact: true }).click();
  await page.getByRole("option", { exact: true, name: "Tratamiento" }).click();
  await dialog.getByLabel("Disciplina *", { exact: true }).click();
  await page
    .getByRole("option", { exact: true, name: "Neuropsicología" })
    .click();
  await dialog
    .getByLabel("Observaciones", { exact: true })
    .fill("Observación sintética inicial");
  await dialog
    .getByRole("button", { exact: true, name: "Crear sesión" })
    .click();
  await expect(dialog).toHaveCount(0);
  await page
    .getByRole("row")
    .filter({ hasText: "Observación sintética inicial" })
    .getByRole("button", { exact: true, name: "Editar sesión" })
    .click();
  await dialog
    .getByLabel("Observaciones", { exact: true })
    .fill("Observación sintética revisada");
  await dialog.getByRole("button", { name: SAVE_BUTTON }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "Observación sintética revisada" })
  ).toContainText("Neuropsicología");
  await page.getByRole("tab", { exact: true, name: "Tests" }).click();
  await page.getByRole("button", { name: NEW_TEST_BUTTON }).first().click();
  await dialog.getByLabel("Proceso evaluado *", { exact: true }).click();
  await page.getByRole("option", { exact: true, name: "Atención" }).click();
  await dialog
    .getByLabel("Nombre del test", { exact: true })
    .fill("Evaluación sintética");
  await dialog.getByLabel("Puntuación", { exact: true }).fill("7/10");
  await dialog.getByRole("button", { exact: true, name: "Crear test" }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await page.getByRole("tab", { exact: true, name: "Tests" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Evaluación sintética" })
  ).toContainText("7/10");

  const { stranger } = testRun;
  const otherContext = await browser.newContext({
    baseURL: new URL(patientUrl).origin,
    extraHTTPHeaders: process.env.E2E_BASE_URL ? deploymentHeaders() : {},
  });
  try {
    await signInUser(otherContext.request, {
      email: stranger.email,
      password: stranger.password,
    });
    const otherPage = await otherContext.newPage();
    await otherPage.goto(patientUrl);
    // A streamed Next.js notFound response can have HTTP status 200.
    await expect(
      otherPage.getByRole("heading", { exact: true, name: "404" })
    ).toBeVisible();
    await expect(otherPage.getByText(name, { exact: true })).toHaveCount(0);
    await otherPage.goto("/dashboard/patients");
    await expect(otherPage.getByText(name, { exact: true })).toHaveCount(0);
  } finally {
    await otherContext.close();
  }
});
