import { expect, test } from "@playwright/test";

test("staff board shows needs-attention lane", async ({ page }) => {
  await page.goto("/manager/orders");
  await expect(
    page.getByRole("heading", { name: "needs attention" }),
  ).toBeVisible();
});
