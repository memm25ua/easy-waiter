import { expect, test } from "@playwright/test";

test("owner views analytics summary", async ({ page }) => {
  await page.goto("/manager/analytics");
  await expect(
    page.getByRole("heading", { name: "Workload summary" }),
  ).toBeVisible();
  await expect(page.getByText("AI-assisted orders")).toBeVisible();
});
