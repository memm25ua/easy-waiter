import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Manager i18n flows require authenticated production test data.",
);

test("manager surfaces render Spanish product copy", async ({ page }) => {
  await page.goto("/manager?lang=es");
  await expect(
    page.getByRole("heading", { name: "Resumen del servicio" }),
  ).toBeVisible();
});
