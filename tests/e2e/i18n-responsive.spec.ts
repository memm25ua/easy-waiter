import { expect, test } from "@playwright/test";

test("Spanish landing controls fit on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?lang=es");
  const primary = page.getByRole("link", { name: "Empezar" }).first();
  const secondary = page
    .getByRole("link", { name: "Solicitar contacto" })
    .first();
  await expect(primary).toBeVisible();
  await expect(secondary).toBeVisible();
  await expect(page.getByLabel("Idioma")).toBeVisible();
});
