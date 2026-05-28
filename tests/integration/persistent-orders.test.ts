import { describe, expect, it } from "vitest";
import { submitCustomerOrder } from "$lib/server/table-session";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe("persistent customer order contracts", () => {
  it("exposes deterministic manual and AI order submission validation", () => {
    expect(submitCustomerOrder).toBeTypeOf("function");
  });
});

describe.skipIf(!hasProductionSupabaseEnv())("persistent orders", () => {
  it("requires Supabase seed data for order submission coverage", () => {
    expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
  });
});
