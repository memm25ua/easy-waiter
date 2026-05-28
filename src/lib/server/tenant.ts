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

export function canManageMenus(staff: StaffAssignment, locationId: string) {
  return (
    staff.isActive !== false &&
    (staff.role === "owner" ||
      (staff.role === "manager" && staff.locationId === locationId))
  );
}

export function canManageTableSessions(
  staff: StaffAssignment,
  locationId: string,
) {
  return (
    staff.isActive !== false &&
    (staff.role === "owner" || staff.locationId === locationId)
  );
}

export function canHandleOrders(staff: StaffAssignment, locationId: string) {
  return staff.isActive !== false && staff.locationId === locationId;
}

export function assertCanManageMenus(
  staff: StaffAssignment,
  locationId: string,
) {
  if (!canManageMenus(staff, locationId)) {
    throw error(403, "You do not have access to manage this menu.");
  }
}

export function assertCanManageTableSessions(
  staff: StaffAssignment,
  locationId: string,
) {
  if (!canManageTableSessions(staff, locationId)) {
    throw error(403, "You do not have access to manage this table.");
  }
}

export function assertCanHandleOrders(
  staff: StaffAssignment,
  locationId: string,
) {
  if (!canHandleOrders(staff, locationId)) {
    throw error(403, "You do not have access to these orders.");
  }
}

export function buildTableLinkScope(locationId: string, tableId: string) {
  return { locationId, tableId };
}
