import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Authenticated analytics flow requires production test env.",
);

test("owner views analytics summary", async ({ page }) => {
  await page.goto("/manager/analytics");
  await expect(
    page.getByRole("heading", { name: "Workload summary" }),
  ).toBeVisible();
  await expect(page.getByText("AI-assisted orders")).toBeVisible();
});
