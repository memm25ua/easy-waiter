import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Supabase-backed customer flow requires production test env.",
);

test("customer submits a manual table order", async ({ page }) => {
  await page.goto("/table/DEMO-1");
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Submit order" }).click();
  await expect(
    page.getByText(/Order submitted.|Side is required/),
  ).toBeVisible();
});
