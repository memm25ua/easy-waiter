import { describe, expect, it } from "vitest";
import { assertRole, assertTenantLocation } from "$lib/server/tenant";
import { demoStaff } from "$lib/server/demo-data";

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
});
