import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Authenticated menu flow requires production test env.",
);

test("manager can review and publish a menu", async ({ page }) => {
  await page.goto("/manager/menus");
  await expect(page.getByRole("heading", { name: "Menus" })).toBeVisible();
  await page.getByRole("link", { name: "Review" }).click();
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Menu published.")).toBeVisible();
});
