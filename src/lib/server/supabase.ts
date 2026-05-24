import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Cookies } from "@sveltejs/kit";

const url = publicEnv.PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const anonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY || "demo-anon-key";

export function createSupabaseBrowserClient() {
  return createBrowserClient(url, anonKey);
}

export function createSupabaseServerClient(cookies: Cookies) {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (
        values: {
          name: string;
          value: string;
          options: Record<string, unknown>;
        }[],
      ) => {
        for (const { name, value, options } of values) {
          cookies.set(name, value, { ...options, path: options.path ?? "/" });
        }
      },
    },
  });
}

export function createServiceRoleClient() {
  return createClient(url, privateEnv.SUPABASE_SERVICE_ROLE_KEY || anonKey, {
    auth: { persistSession: false },
  });
}
