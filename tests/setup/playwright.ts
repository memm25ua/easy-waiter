import { expect } from "@playwright/test";
export { hasProductionSupabaseEnv } from "./production-env";

export async function signInAs(page: any, email: string, password = "password123") {
  await page.goto("/auth/sign-in");
  await page.waitForSelector('body[data-hydrated="true"]');

  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');

  await emailInput.fill(email);
  await passwordInput.fill(password);

  await page.locator('main form button').first().click();
  await expect(page).not.toHaveURL(/\/auth\/sign-in/);
}
