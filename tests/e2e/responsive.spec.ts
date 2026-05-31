import { expect, test } from "@playwright/test";
import { signInAs } from "../setup/playwright";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Authenticated responsive flows require production test env.",
);

test("customer phone, staff tablet, and manager desktop layouts render and comply with DESIGN.md", async ({
  page,
}) => {
  // Mobile Viewport Audit
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/table/DEMO-1");
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }),
  ).toBeVisible();

  // Validate warm cream canvas background color
  const canvasBgColor = await page.locator("body").evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });
  expect(canvasBgColor).toBe("rgb(250, 249, 245)"); // #faf9f5 matches DESIGN.md

  // Validate that on mobile viewport, customer layout columns collapse and stack vertically
  const menuHeader = await page.locator("main > section").first().boundingBox();
  const cartSection = await page.locator("aside").boundingBox();
  if (menuHeader && cartSection) {
    expect(cartSection.y).toBeGreaterThanOrEqual(
      menuHeader.y + menuHeader.height,
    );
  }

  // Authenticate as seeded owner-a to access manager pages
  await signInAs(page, "owner-a@example.com");

  // Tablet Viewport Audit
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/manager/orders");
  await expect(
    page.getByRole("heading", { name: "Staff order board" }),
  ).toBeVisible();

  // Desktop Viewport Audit
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/manager/menus");
  await expect(page.getByRole("heading", { name: "Menus" })).toBeVisible();

  // Validate side-by-side grid layout on desktop
  const asideNav = await page.locator("aside").boundingBox();
  const contentSection = await page.locator("main > section").boundingBox();
  if (asideNav && contentSection) {
    expect(contentSection.x).toBeGreaterThan(asideNav.x);
  }
});
