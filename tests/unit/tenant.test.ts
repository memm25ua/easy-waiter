import { describe, expect, it } from "vitest";
import {
  assertRole,
  assertTenantLocation,
  canHandleOrders,
  canManageMenus,
  canManageTableSessions,
} from "$lib/server/tenant";
import { demoStaff } from "$lib/server/demo-data";
import type { StaffAssignment } from "$lib/types";

describe("tenant helper scoping", () => {
  it("allows the active assignment location", () => {
    expect(() =>
      assertTenantLocation(demoStaff, demoStaff.locationId),
    ).not.toThrow();
  });

  it("blocks another location and missing role", () => {
    expect(() => assertTenantLocation(demoStaff, "other-location")).toThrow();
    expect(() => assertRole(demoStaff, ["owner"])).toThrow();
  });

  it("allows owners to manage menus and tables across restaurant scope", () => {
    const owner: StaffAssignment = { ...demoStaff, role: "owner" };
    expect(canManageMenus(owner, "other-location")).toBe(true);
    expect(canManageTableSessions(owner, "other-location")).toBe(true);
  });

  it("scopes managers to assigned-location menu and table management", () => {
    const manager: StaffAssignment = { ...demoStaff, role: "manager" };
    expect(canManageMenus(manager, demoStaff.locationId)).toBe(true);
    expect(canManageMenus(manager, "other-location")).toBe(false);
    expect(canManageTableSessions(manager, demoStaff.locationId)).toBe(true);
  });

  it("limits staff to assigned-location order handling", () => {
    const staff: StaffAssignment = { ...demoStaff, role: "staff" };
    expect(canManageMenus(staff, demoStaff.locationId)).toBe(false);
    expect(canHandleOrders(staff, demoStaff.locationId)).toBe(true);
    expect(canHandleOrders(staff, "other-location")).toBe(false);
  });
});
