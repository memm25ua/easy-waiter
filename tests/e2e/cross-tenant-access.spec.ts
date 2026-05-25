import { test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Cross-tenant browser test requires two Supabase users.",
);

test("blocks another restaurant account", async () => {});
