import { createBrowserClient } from "@supabase/ssr";
import { env } from "$env/dynamic/public";

if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase browser configuration is required. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createBrowserClient(
  env.PUBLIC_SUPABASE_URL,
  env.PUBLIC_SUPABASE_ANON_KEY,
);
