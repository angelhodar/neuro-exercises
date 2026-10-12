import { expect } from "@playwright/test";
import { publicTest as test } from "../support/fixtures";

const LOGIN_URL = /\/login/;
const DASHBOARD_URL = /\/dashboard$/;
const USER_MENU = /Synthetic professional/;

test("anonymous dashboard access redirects to login", async ({ page }) => {
  await page.goto("/dashboard/patients");
  await expect(page).toHaveURL(LOGIN_URL);
});

test("invalid credentials, login, logout, and restricted administration", async ({
  page,
  testRun,
}) => {
  const user = testRun.professional;
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Incorrect-password-2026");
  await page
    .getByRole("button", { exact: true, name: "Iniciar Sesión" })
    .click();
  await expect(
    page.getByText(
      "No se pudo iniciar sesión. Comprueba tus credenciales e inténtalo de nuevo."
    )
  ).toBeVisible();
  await page.getByLabel("Contraseña", { exact: true }).fill(user.password);
  await page
    .getByRole("button", { exact: true, name: "Iniciar Sesión" })
    .click();
  await expect(page).toHaveURL(DASHBOARD_URL);
  await page.goto("/dashboard/users");
  await expect(page).toHaveURL(DASHBOARD_URL);
  await page.getByRole("button", { name: USER_MENU }).click();
  await page.getByRole("menuitem", { name: "Cerrar Sesión" }).click();
  await expect(page).toHaveURL(LOGIN_URL);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(LOGIN_URL);
});
