import { expect, test } from "@playwright/test";

for (const path of [
  "/manager",
  "/manager/menus",
  "/manager/orders",
  "/manager/analytics",
]) {
  test(`protects ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
}
