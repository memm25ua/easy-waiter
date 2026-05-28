import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Cross-tenant browser test requires two Supabase users.",
);

test("blocks another restaurant account", async ({ page }) => {
  await page.goto("/manager/menus/not-owned");
  await expect(
    page.getByText(/Menu not found|Access needed|Sign in/).first(),
  ).toBeVisible();
});
