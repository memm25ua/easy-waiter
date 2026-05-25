import { expect, test } from "@playwright/test";

test("landing first viewport responds within budget", async ({ page }) => {
  const start = Date.now();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Easy Waiter" }),
  ).toBeVisible();
  expect(Date.now() - start).toBeLessThan(2000);
});
