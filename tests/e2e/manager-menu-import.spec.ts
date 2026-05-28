import { expect, test } from "@playwright/test";
import { signInAs } from "../setup/playwright";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Authenticated menu flow requires production test env.",
);

test("manager can review and publish a menu", async ({ page }) => {
  await signInAs(page, "owner-a@example.com");
  await page.goto("/manager/menus");
  await expect(page.getByRole("heading", { name: "Menus" })).toBeVisible();
  await page.getByRole("link", { name: "Review" }).click();
  await expect(page).toHaveURL(/\/manager\/menus\/[0-9a-f-]+/);
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }).first(),
  ).toBeVisible();
  await page.getByLabel("Menu title").fill("Demo Bistro Menu");
  await page.getByRole("button", { name: "Save review" }).click();
  await expect(page.getByText("Menu saved.")).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Menu published.")).toBeVisible();
});

test("manager sees conflict review when publishing a stale menu", async ({
  page,
}) => {
  await signInAs(page, "owner-a@example.com");
  await page.goto("/manager/menus/50000000-0000-0000-0000-000000000001");
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }).first(),
  ).toBeVisible();
  await page.locator('input[name="lastSeenVersion"]').evaluate((el) => {
    (el as HTMLInputElement).value = "0";
  });
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(
    page.getByText("This menu changed in another session.").first(),
  ).toBeVisible();
});

test("manager can start PDF or image import review", async ({ page }) => {
  await signInAs(page, "owner-a@example.com");
  await page.goto("/manager/menus");
  await expect(page.getByRole("heading", { name: "Menus" })).toBeVisible();
  await expect(page.getByLabel("Upload PDF or scan")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create draft" }),
  ).toBeVisible();
});
