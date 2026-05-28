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

export const rlsRestaurantA = "10000000-0000-0000-0000-000000000001";
export const rlsRestaurantB = "10000000-0000-0000-0000-000000000002";
export const rlsLocationA = "20000000-0000-0000-0000-000000000001";
export const rlsLocationB = "20000000-0000-0000-0000-000000000002";
export const rlsTableA = "30000000-0000-0000-0000-000000000001";
export const rlsTableB = "30000000-0000-0000-0000-000000000002";

export function menuImportStoragePath(input: {
  restaurantId?: string;
  locationId?: string;
  importJobId?: string;
  fileName?: string;
}) {
  return [
    input.restaurantId ?? rlsRestaurantA,
    input.locationId ?? rlsLocationA,
    input.importJobId ?? "50000000-0000-0000-0000-000000000001",
    input.fileName ?? "menu.pdf",
  ].join("/");
}

export async function seedCompleteWorkflowScope(client = createAdminClient()) {
  await client.from("restaurants").upsert([
    { id: rlsRestaurantA, name: "RLS Bistro A", slug: "rls-bistro-a" },
    { id: rlsRestaurantB, name: "RLS Bistro B", slug: "rls-bistro-b" },
  ]);
  await client.from("locations").upsert([
    {
      id: rlsLocationA,
      restaurant_id: rlsRestaurantA,
      name: "Location A",
      timezone: "Europe/Madrid",
      currency: "EUR",
    },
    {
      id: rlsLocationB,
      restaurant_id: rlsRestaurantB,
      name: "Location B",
      timezone: "Europe/Madrid",
      currency: "EUR",
    },
  ]);
  await client.from("restaurant_tables").upsert([
    {
      id: rlsTableA,
      location_id: rlsLocationA,
      label: "Table A",
      session_code: "RLS-A",
      qr_token: "rls-a-token",
      stable_entry_token_hash: "rls-a-token",
    },
    {
      id: rlsTableB,
      location_id: rlsLocationB,
      label: "Table B",
      session_code: "RLS-B",
      qr_token: "rls-b-token",
      stable_entry_token_hash: "rls-b-token",
    },
  ]);
}
