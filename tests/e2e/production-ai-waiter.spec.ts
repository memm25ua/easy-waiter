import { test } from "@playwright/test";

test.skip(
  !process.env.PUBLIC_SUPABASE_URL || !process.env.OPENROUTER_API_KEY,
  "AI waiter production flow requires Supabase and OpenRouter.",
);

test("AI waiter confirms exact proposal and falls back safely", async () => {});
