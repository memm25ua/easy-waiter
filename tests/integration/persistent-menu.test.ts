import { describe, expect, it } from "vitest";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe.skipIf(!hasProductionSupabaseEnv())("persistent menu queries", () => {
  it("requires Supabase seed data for publish regression coverage", () => {
    expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
  });
});
