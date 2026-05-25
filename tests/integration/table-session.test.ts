import { describe, expect, it } from "vitest";
import { getTableSession } from "$lib/server/table-session";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe.skipIf(!hasProductionSupabaseEnv())("table session loader", () => {
  it("resolves active, expired, and invalid sessions", async () => {
    await expect(getTableSession("DEMO-1")).resolves.toMatchObject({
      status: "active",
    });
    await expect(getTableSession("EXPIRED")).resolves.toMatchObject({
      status: "expired",
    });
    await expect(getTableSession("NOPE")).resolves.toBeNull();
  });
});
