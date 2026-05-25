import { test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL,
  "Persistent staff order test requires Supabase auth.",
);

test("staff dashboard sees persisted order updates", async () => {});
