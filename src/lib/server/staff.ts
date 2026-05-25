import { error } from "@sveltejs/kit";
import { createOpaqueToken, hashToken } from "./security";
import { createServiceRoleClient } from "./supabase";
import type { StaffAssignment, StaffInvitation, StaffRole } from "$lib/types";

const permissions: Record<StaffRole, Set<string>> = {
  owner: new Set([
    "restaurant:setup",
    "staff:manage",
    "location:manage",
    "menu:manage",
    "orders:update",
    "analytics:read",
    "deployment:read",
  ]),
  manager: new Set([
    "location:manage",
    "menu:manage",
    "orders:update",
    "analytics:read",
  ]),
  staff: new Set(["orders:update"]),
};

export function can(staff: StaffAssignment, capability: string) {
  return permissions[staff.role].has(capability);
}

export function requireCapability(staff: StaffAssignment, capability: string) {
  if (!can(staff, capability)) {
    throw new Error(`Missing staff capability: ${capability}`);
  }
}

interface InvitationRow {
  id: string;
  restaurant_id: string;
  location_id: string;
  email: string;
  role: "manager" | "staff";
  status: StaffInvitation["status"];
  invited_by_account_id: string;
  accepted_by_account_id: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapInvitation(row: InvitationRow): StaffInvitation {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    locationId: row.location_id,
    email: row.email,
    role: row.role,
    status: row.status,
    invitedByAccountId: row.invited_by_account_id,
    acceptedByAccountId: row.accepted_by_account_id,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
  };
}

export async function listStaffInvitations(staff: StaffAssignment) {
  const query = createServiceRoleClient()
    .from("staff_invitations")
    .select(
      "id,restaurant_id,location_id,email,role,status,invited_by_account_id,accepted_by_account_id,expires_at,accepted_at,created_at",
    )
    .eq("restaurant_id", staff.restaurantId)
    .order("created_at", { ascending: false });

  if (staff.role === "manager") {
    query.eq("role", "staff").eq("location_id", staff.locationId);
  } else if (staff.role !== "owner") {
    return [];
  }

  const { data, error: queryError } = await query;
  if (queryError) throw queryError;
  return ((data ?? []) as InvitationRow[]).map(mapInvitation);
}

export async function createStaffInvitation(input: {
  actor: StaffAssignment;
  email: string;
  role: "manager" | "staff";
  locationId: string;
  expiresAt?: Date;
}) {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    throw error(400, "Enter a valid staff email address.");
  }
  if (input.actor.role === "staff") {
    throw error(403, "You do not have access to invite staff.");
  }
  if (input.actor.role === "manager") {
    if (input.role !== "staff" || input.locationId !== input.actor.locationId) {
      throw error(403, "Managers can invite staff only for their location.");
    }
  }

  const token = createOpaqueToken();
  const { data, error: insertError } = await createServiceRoleClient()
    .from("staff_invitations")
    .insert({
      restaurant_id: input.actor.restaurantId,
      location_id: input.locationId,
      email,
      role: input.role,
      token_hash: hashToken(token),
      invited_by_account_id: input.actor.accountId,
      expires_at:
        input.expiresAt?.toISOString() ??
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select(
      "id,restaurant_id,location_id,email,role,status,invited_by_account_id,accepted_by_account_id,expires_at,accepted_at,created_at",
    )
    .single();
  if (insertError) throw insertError;
  return { invitation: mapInvitation(data as InvitationRow), token };
}

export async function acceptStaffInvitation(input: {
  token: string;
  accountId: string;
  email: string;
}) {
  const client = createServiceRoleClient();
  const tokenHash = hashToken(input.token);
  const { data: invitation, error: invitationError } = await client
    .from("staff_invitations")
    .select(
      "id,restaurant_id,location_id,email,role,status,invited_by_account_id,accepted_by_account_id,expires_at,accepted_at,created_at",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (invitationError) throw invitationError;
  if (!invitation) throw error(404, "Invitation not found.");

  const mapped = mapInvitation(invitation as InvitationRow);
  if (mapped.status !== "pending") {
    throw error(400, "This invitation is no longer available.");
  }
  if (new Date(mapped.expiresAt).getTime() <= Date.now()) {
    await client
      .from("staff_invitations")
      .update({ status: "expired" })
      .eq("id", mapped.id);
    throw error(400, "This invitation has expired.");
  }
  if (normalizeEmail(input.email) !== mapped.email) {
    throw error(403, "Sign in with the email address that was invited.");
  }

  const { data: existing, error: existingError } = await client
    .from("staff_members")
    .select("id")
    .eq("user_id", input.accountId)
    .eq("restaurant_id", mapped.restaurantId)
    .eq("location_id", mapped.locationId)
    .eq("is_active", true)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) throw error(409, "This account already has restaurant access.");

  const now = new Date().toISOString();
  const { error: assignmentError } = await client.from("staff_members").insert({
    restaurant_id: mapped.restaurantId,
    location_id: mapped.locationId,
    user_id: input.accountId,
    role: mapped.role,
    is_active: true,
    invitation_id: mapped.id,
    accepted_at: now,
  });
  if (assignmentError) throw assignmentError;

  const { error: updateError } = await client
    .from("staff_invitations")
    .update({
      status: "accepted",
      accepted_by_account_id: input.accountId,
      accepted_at: now,
    })
    .eq("id", mapped.id);
  if (updateError) throw updateError;
}
