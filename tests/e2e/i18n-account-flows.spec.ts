import { expect, test } from "@playwright/test";

test("landing and account pages render in Spanish and English", async ({
  page,
}) => {
  await page.goto("/?lang=es");
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Empezar" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Solicitar contacto" }),
  ).toBeVisible();

  await page.goto("/auth/sign-in?lang=es");
  await expect(
    page.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeVisible();

  await page.goto("/auth/sign-up?lang=en");
  await expect(
    page.getByRole("heading", { name: "Create your restaurant account" }),
  ).toBeVisible();
});
