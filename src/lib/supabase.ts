import { createBrowserClient } from "@supabase/ssr";
import { env } from "$env/dynamic/public";

export const supabase = createBrowserClient(
  env.PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
  env.PUBLIC_SUPABASE_ANON_KEY || "demo-anon-key",
);
