import { error } from "@sveltejs/kit";
import type { StaffAssignment, StaffRole } from "$lib/types";

export function assertTenantLocation(
  staff: StaffAssignment,
  locationId: string,
) {
  if (staff.locationId !== locationId) {
    throw error(404, "Resource not found.");
  }
}

export function assertTenantRestaurant(
  staff: StaffAssignment,
  restaurantId: string,
) {
  if (staff.restaurantId !== restaurantId) {
    throw error(404, "Resource not found.");
  }
}

export function assertRole(staff: StaffAssignment, roles: StaffRole[]) {
  if (!roles.includes(staff.role)) {
    throw error(403, "You do not have access to this action.");
  }
}

export function noTenantAccess(
  message = "You need restaurant access to continue.",
) {
  throw error(403, message);
}
