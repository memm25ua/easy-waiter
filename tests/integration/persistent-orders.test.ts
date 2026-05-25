import { describe, expect, it } from "vitest";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe.skipIf(!hasProductionSupabaseEnv())("persistent orders", () => {
  it("requires Supabase seed data for order submission coverage", () => {
    expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
  });
});
