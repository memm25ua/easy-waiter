import { expect, test } from "@playwright/test";
import { signInAs } from "../setup/playwright";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Manager i18n flows require authenticated production test data.",
);

test("manager surfaces render Spanish product copy", async ({ page }) => {
  await signInAs(page, "owner-a@example.com");
  await page.goto("/manager?lang=es");
  await expect(
    page.getByRole("heading", { name: "Resumen del servicio" }),
  ).toBeVisible();
});
