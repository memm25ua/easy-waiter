import { describe, expect, it } from "vitest";
import { demoStaff } from "$lib/server/demo-data";
import { requireStaff } from "$lib/server/auth";

describe("staff access policy helper", () => {
  it("returns an active staff assignment from locals", async () => {
    await expect(requireStaff({ staff: demoStaff })).resolves.toMatchObject({
      locationId: demoStaff.locationId,
      role: "manager",
    });
  });

  it("does not fall back to demo staff without an assignment", async () => {
    await expect(
      requireStaff({ staff: null, account: null }),
    ).rejects.toBeTruthy();
  });
});
