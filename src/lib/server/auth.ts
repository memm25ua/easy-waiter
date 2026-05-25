import { redirect } from "@sveltejs/kit";
import type { StaffAssignment, StaffRole } from "$lib/types";

interface StaffRow {
  id: string;
  user_id: string | null;
  restaurant_id: string;
  location_id: string;
  role: StaffRole;
  invitation_id?: string | null;
  accepted_at?: string | null;
  restaurants: { name: string } | { name: string }[] | null;
  locations:
    | { name: string; currency: string }
    | { name: string; currency: string }[]
    | null;
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapStaffAssignment(row: StaffRow): StaffAssignment {
  const restaurant = one(row.restaurants);
  const location = one(row.locations);
  return {
    id: row.id,
    accountId: row.user_id,
    restaurantId: row.restaurant_id,
    locationId: row.location_id,
    role: row.role,
    restaurantName: restaurant?.name ?? "Restaurant",
    locationName: location?.name ?? "Location",
    currency: location?.currency ?? "EUR",
    invitationId: row.invitation_id ?? null,
    acceptedAt: row.accepted_at ?? null,
  };
}

export async function loadRequestContext(locals: App.Locals) {
  if (!locals.supabase) {
    locals.session = null;
    locals.account = null;
    locals.staff = null;
    return;
  }

  const {
    data: { user },
  } = await locals.supabase.auth.getUser();

  locals.account = user ?? null;
  locals.session = user
    ? (await locals.supabase.auth.getSession()).data.session
    : null;
  locals.staff = user ? await resolveStaffAssignment(locals, user.id) : null;
}

export async function resolveStaffAssignment(
  locals: App.Locals,
  accountId: string,
): Promise<StaffAssignment | null> {
  if (!locals.supabase) return null;
  const { data, error } = await locals.supabase
    .from("staff_members")
    .select(
      "id,user_id,restaurant_id,location_id,role,invitation_id,accepted_at,restaurants(name),locations(name,currency)",
    )
    .eq("user_id", accountId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapStaffAssignment(data as StaffRow);
}

export async function getStaffAssignment(
  locals: App.Locals,
): Promise<StaffAssignment | null> {
  return locals.staff ?? null;
}

export async function requireStaff(
  locals: App.Locals,
  roles: StaffRole[] = ["owner", "manager", "staff"],
) {
  const staff = await getStaffAssignment(locals);
  if (!staff || !roles.includes(staff.role)) {
    throw redirect(303, locals.account ? "/onboarding" : "/auth/sign-in");
  }
  return staff;
}

export async function requireAccount(locals: App.Locals) {
  if (!locals.account) throw redirect(303, "/auth/sign-in");
  return locals.account;
}
