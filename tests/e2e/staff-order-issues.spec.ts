import { expect, test } from "@playwright/test";
import { signInAs } from "../setup/playwright";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Authenticated staff flow requires production test env.",
);

test("staff board shows needs-attention lane", async ({ page }) => {
  await signInAs(page, "owner-a@example.com");
  await page.goto("/manager/orders");

  // Locate the first order card in the 'New' column
  const newColumn = page.locator("section").filter({ hasText: "New" });
  const firstOrderCard = newColumn.locator("article").first();

  // Select "needs attention" in the dropdown and click Update
  await firstOrderCard.locator('select[name="status"]').selectOption({ label: "needs attention" });
  await firstOrderCard.getByRole("button", { name: "Update" }).click();

  // Verify the order moves to 'Needs attention' column and shows 'Review reason'
  const needsAttentionColumn = page.locator("section").filter({ hasText: "Needs attention" });
  await expect(needsAttentionColumn.getByText("Review reason").first()).toBeVisible();
});
