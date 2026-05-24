import { expect, test } from "@playwright/test";

test("customer phone, staff tablet, and manager desktop layouts render", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/table/DEMO-1");
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/manager/orders");
  await expect(
    page.getByRole("heading", { name: "Staff order board" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/manager/menus");
  await expect(page.getByRole("heading", { name: "Menus" })).toBeVisible();
});
