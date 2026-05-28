import { describe, expect, it } from "vitest";
import {
  closeTableSession,
  getTableSession,
  openTableSession,
  resolveCustomerTableLink,
} from "$lib/server/table-session";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe("stable table link service contracts", () => {
  it("exposes active session lifecycle and stable link resolution", () => {
    expect(openTableSession).toBeTypeOf("function");
    expect(closeTableSession).toBeTypeOf("function");
    expect(resolveCustomerTableLink).toBeTypeOf("function");
  });
});

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
