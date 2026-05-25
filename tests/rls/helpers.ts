import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireProductionSupabaseEnv } from "../setup/production-env";

export function createAdminClient(): SupabaseClient {
  requireProductionSupabaseEnv();
  return createClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export function createAnonClient(): SupabaseClient {
  requireProductionSupabaseEnv();
  return createClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
