import { describe, expect, it } from "vitest";
import { can } from "$lib/server/staff";
import { demoStaff } from "$lib/server/demo-data";

describe("staff role permissions", () => {
  it("allows managers to manage menus and read analytics", () => {
    expect(can(demoStaff, "menu:manage")).toBe(true);
    expect(can(demoStaff, "analytics:read")).toBe(true);
    expect(can(demoStaff, "deployment:read")).toBe(false);
  });
});
