import { expect, test } from "@playwright/test";

test("landing first viewport responds within budget", async ({ page }) => {
  const start = Date.now();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Easy Waiter" }),
  ).toBeVisible();
  expect(Date.now() - start).toBeLessThan(2000);
});

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Customer table performance requires Supabase-backed menu data.",
);

test("customer menu browsing responds within budget", async ({ page }) => {
  const start = Date.now();
  await page.goto("/table/DEMO-1");
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }),
  ).toBeVisible();
  expect(Date.now() - start).toBeLessThan(2000);
});
