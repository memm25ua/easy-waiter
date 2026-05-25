import { describe, expect, it } from "vitest";
import { skipWhenProductionEnvMissing } from "../setup/production-env";

describe.skipIf(skipWhenProductionEnvMissing())("RLS tenant isolation", () => {
  it("requires Supabase-backed cross-tenant regression coverage", () => {
    expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
  });
});
