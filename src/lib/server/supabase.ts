import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Cookies } from "@sveltejs/kit";

export const MENU_IMPORTS_BUCKET = "menu-imports";

function requirePublicConfig() {
  const url = publicEnv.PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase public configuration is required. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url, anonKey };
}

export function hasSupabasePublicConfig() {
  return Boolean(
    publicEnv.PUBLIC_SUPABASE_URL && publicEnv.PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseServiceConfig() {
  return Boolean(privateEnv.SUPABASE_SERVICE_ROLE_KEY);
}

export function createSupabaseBrowserClient() {
  const { url, anonKey } = requirePublicConfig();
  return createBrowserClient(url, anonKey);
}

export function createSupabaseServerClient(cookies: Cookies) {
  const { url, anonKey } = requirePublicConfig();
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
  const { url } = requirePublicConfig();
  const serviceRoleKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for privileged server operations.",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export function buildMenuImportResourcePath(input: {
  restaurantId: string;
  locationId: string;
  importJobId: string;
  fileName: string;
}) {
  const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${input.restaurantId}/${input.locationId}/${input.importJobId}/${safeFileName}`;
}

export async function uploadMenuImportResource(input: {
  path: string;
  body: Blob | ArrayBuffer | Uint8Array;
  contentType: string;
}) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(MENU_IMPORTS_BUCKET)
    .upload(input.path, input.body, {
      contentType: input.contentType,
      upsert: false,
    });

  if (error) throw error;
  return data;
}

export async function createMenuImportResourceReference(path: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(MENU_IMPORTS_BUCKET)
    .createSignedUrl(path, 60 * 10);

  if (error) throw error;
  return data.signedUrl;
}
