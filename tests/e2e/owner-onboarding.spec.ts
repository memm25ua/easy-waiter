import { test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Owner onboarding requires Supabase auth test env.",
);

test("owner sign-up reaches first dashboard", async () => {});
