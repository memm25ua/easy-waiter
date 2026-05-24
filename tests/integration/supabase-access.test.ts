import { describe, expect, it } from "vitest";
import { demoStaff } from "$lib/server/demo-data";
import { requireStaff } from "$lib/server/auth";

describe("staff access policy helper", () => {
  it("returns active demo staff assignment", async () => {
    await expect(requireStaff({ staff: demoStaff })).resolves.toMatchObject({
      locationId: demoStaff.locationId,
      role: "manager",
    });
  });
});
