import { expect, test } from "@playwright/test";

test("public page does not expose staff-only demo data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Demo table")).toHaveCount(0);
  await expect(page.getByText("Staff order board")).toHaveCount(0);
});
