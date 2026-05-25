import { expect, test } from "@playwright/test";

test("landing first viewport works on phone and desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Easy Waiter" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(
    page.getByRole("link", { name: "Start setup" }).first(),
  ).toBeVisible();
});
