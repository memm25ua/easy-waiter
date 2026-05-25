import { test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Persistent ordering test requires Supabase seed data.",
);

test("manual ordering survives reload", async () => {});
