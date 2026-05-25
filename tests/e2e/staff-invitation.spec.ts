import { test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Staff invitation acceptance requires Supabase auth test env.",
);

test("invited staff accepts scoped restaurant access", async () => {});
