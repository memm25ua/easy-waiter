import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Table token security flow requires Supabase test env.",
);

test("invalid and expired table tokens cannot order", async ({ page }) => {
  await page.goto("/table/not-a-real-table-token");
  await expect(page.getByText("This table link is not valid.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit order" })).toHaveCount(
    0,
  );
});
