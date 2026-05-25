import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Authenticated staff flow requires production test env.",
);

test("staff sees dashboard orders and status controls", async ({ page }) => {
  await page.goto("/manager/orders");
  await expect(
    page.getByRole("heading", { name: "Staff order board" }),
  ).toBeVisible();
  await expect(page.getByText("Live order updates connected.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Update" }).first(),
  ).toBeVisible();
});
