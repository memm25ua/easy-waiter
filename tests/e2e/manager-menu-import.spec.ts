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
  await page.getByLabel("Menu title").fill("Demo Bistro Dinner Menu");
  await page.getByRole("button", { name: "Save review" }).click();
  await expect(page.getByText("Menu saved.")).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Menu published.")).toBeVisible();
});

test("manager sees conflict review when publishing a stale menu", async ({
  page,
}) => {
  await page.goto("/manager/menus/menu-demo");
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }),
  ).toBeVisible();
  await page.locator('input[name="lastSeenVersion"]').fill("0");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(
    page.getByText("This menu changed in another session."),
  ).toBeVisible();
});

test("manager can start PDF or image import review", async ({ page }) => {
  await page.goto("/manager/menus");
  await expect(page.getByRole("heading", { name: "Menus" })).toBeVisible();
  await expect(page.getByLabel("Upload PDF or scan")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create draft" }),
  ).toBeVisible();
});
