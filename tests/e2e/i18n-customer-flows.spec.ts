import { expect, test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Customer i18n flows require local or production Supabase data.",
);

test("customer table ordering renders Spanish product copy", async ({
  page,
}) => {
  await page.goto("/table/DEMO-1?lang=es");
  await expect(
    page.getByRole("heading", { name: "Demo Bistro Menu" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enviar pedido" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Preguntar" })).toBeVisible();
});
