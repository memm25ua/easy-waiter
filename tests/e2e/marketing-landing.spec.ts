import { expect, test } from "@playwright/test";

test("public landing shows conversion paths", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Easy Waiter" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start setup" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Request contact" }),
  ).toBeVisible();
});
