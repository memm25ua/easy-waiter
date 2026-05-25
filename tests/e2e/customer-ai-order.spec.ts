import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Supabase-backed customer flow requires production test env.",
);

test("customer confirms an AI-assisted order", async ({ page }) => {
  await page.goto("/table/DEMO-1");
  await page.getByRole("button", { name: "Confirm AI order" }).click();
  await expect(
    page.getByText("Your confirmed order has been sent to the kitchen."),
  ).toBeVisible();
});
