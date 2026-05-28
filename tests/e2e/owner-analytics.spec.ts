import { expect, test } from "@playwright/test";
import { signInAs } from "../setup/playwright";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Authenticated analytics flow requires production test env.",
);

test("owner views analytics summary", async ({ page }) => {
  await signInAs(page, "owner-a@example.com");
  await page.goto("/manager/analytics");
  await expect(
    page.getByRole("heading", { name: "Workload summary" }),
  ).toBeVisible();
  await expect(page.getByText("AI-assisted orders")).toBeVisible();
});
