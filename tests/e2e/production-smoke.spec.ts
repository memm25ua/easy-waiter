import { expect, test } from "@playwright/test";

test("production smoke baseline covers landing and health", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Easy Waiter" }),
  ).toBeVisible();
  const health = await request.get("/health");
  expect([200, 503]).toContain(health.status());
});
