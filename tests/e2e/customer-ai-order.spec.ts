import { expect, test } from "@playwright/test";

test("customer confirms an AI-assisted order", async ({ page }) => {
  await page.goto("/table/DEMO-1");
  await page.getByRole("button", { name: "Confirm AI order" }).click();
  await expect(
    page.getByText("Your confirmed order has been sent to the kitchen."),
  ).toBeVisible();
});
