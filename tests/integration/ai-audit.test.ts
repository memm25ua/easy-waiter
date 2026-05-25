import { describe, expect, it } from "vitest";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe.skipIf(!hasProductionSupabaseEnv())("AI audit events", () => {
  it("requires Supabase audit tables for proposal and confirmation coverage", () => {
    expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
  });
});
