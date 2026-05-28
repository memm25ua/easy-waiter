import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Authenticated staff flow requires production test env.",
);

test("staff board shows needs-attention lane", async ({ page }) => {
  await page.goto("/manager/orders");
  await expect(
    page.getByRole("heading", { name: "needs attention" }),
  ).toBeVisible();
  await expect(page.getByText("Review reason").first()).toBeVisible();
});
