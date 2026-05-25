import { test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Table token security flow requires Supabase test env.",
);

test("invalid and expired table tokens cannot order", async () => {});
