import { describe, expect, it } from "vitest";
import { can } from "$lib/server/staff";
import { canManageMenus, assertCanManageMenus } from "$lib/server/tenant";
import { demoStaff } from "$lib/server/demo-data";
import { productionOwner } from "../fixtures/production";
import {
  productionManager,
  productionStaff,
} from "../fixtures/complete-workflows";

describe("staff role permissions", () => {
  it("allows managers to manage menus and read analytics", () => {
    expect(can(demoStaff, "menu:manage")).toBe(true);
    expect(can(demoStaff, "analytics:read")).toBe(true);
    expect(can(demoStaff, "deployment:read")).toBe(false);
  });

  it("limits menu mutation to owners and assigned managers", () => {
    expect(canManageMenus(productionOwner, productionOwner.locationId)).toBe(
      true,
    );
    expect(
      canManageMenus(productionManager, productionManager.locationId),
    ).toBe(true);
    expect(canManageMenus(productionStaff, productionStaff.locationId)).toBe(
      false,
    );
    expect(
      canManageMenus(productionManager, "20000000-0000-0000-0000-000000000099"),
    ).toBe(false);
  });

  it("throws before staff can mutate menus", () => {
    expect(() =>
      assertCanManageMenus(productionStaff, productionStaff.locationId),
    ).toThrow();
  });
});
