import { expect } from "@playwright/test";
import { withTestDatabase } from "../support/database";
import { test } from "../support/fixtures";
import { proposeBrief } from "../support/requirements";

const EDITOR_URL = /\/dashboard\/exercises\/e2e-/;
const GENERATION_ERROR = /^Error:/;

test("approve a brief, persist a checkpoint, preview, and recover from a failed refinement", async ({
  page,
  professional,
}) => {
  await proposeBrief(page);
  await page
    .getByRole("button", { exact: true, name: "Crear ejercicio" })
    .click();
  await expect(page).toHaveURL(EDITOR_URL);
  await expect(
    page.getByText("Ejercicio preparado para previsualizar.", { exact: true })
  ).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title="Preview"]')
      .getByRole("heading", { name: "Vista previa de prueba" })
  ).toBeVisible();
  const editorUrl = page.url();
  const slug = new URL(editorUrl).pathname.split("/").at(-1);
  const checkpoint = await withTestDatabase((pool) =>
    pool.query(
      "SELECT g.code_blob_key, g.status FROM exercise_chat_generation g JOIN exercises e ON e.id = g.exercise_id WHERE e.slug = $1 AND e.creator_id = $2",
      [slug, professional.id]
    )
  );
  expect(checkpoint.rows[0]).toMatchObject({ status: "COMPLETED" });
  expect(checkpoint.rows[0].code_blob_key).toBeTruthy();
  await page.reload();
  await expect(
    page.getByText("Ejercicio preparado para previsualizar.", { exact: true })
  ).toBeVisible();
  await page
    .getByPlaceholder("Puedes seguir cambiando el ejercicio aqui...")
    .fill("fallar generación");
  await page
    .getByPlaceholder("Puedes seguir cambiando el ejercicio aqui...")
    .press("Enter");
  await expect(page.getByText(GENERATION_ERROR)).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title="Preview"]')
      .getByRole("heading", { name: "Vista previa de prueba" })
  ).toBeVisible();
  await page.getByRole("button", { exact: true, name: "Reintentar" }).click();
  await expect(page.getByText(GENERATION_ERROR)).toHaveCount(0);
  await expect(
    page.getByText("Ejercicio preparado para previsualizar.", { exact: true })
  ).toHaveCount(2);
  const generations = await withTestDatabase((pool) =>
    pool.query(
      "SELECT g.status, g.code_blob_key FROM exercise_chat_generation g JOIN exercises e ON e.id = g.exercise_id WHERE e.slug = $1 ORDER BY g.id",
      [slug]
    )
  );
  expect(generations.rows.map((row) => row.status)).toEqual([
    "COMPLETED",
    "ERROR",
    "COMPLETED",
  ]);
  expect(generations.rows[0].code_blob_key).toBe(
    checkpoint.rows[0].code_blob_key
  );
});
