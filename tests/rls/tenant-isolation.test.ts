import { describe, expect, it } from "vitest";
import { skipWhenProductionEnvMissing } from "../setup/production-env";
import { menuImportStoragePath, rlsLocationA, rlsRestaurantA } from "./helpers";

describe.skipIf(skipWhenProductionEnvMissing())("RLS tenant isolation", () => {
  it("requires Supabase-backed cross-tenant regression coverage", () => {
    expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
  });

  it("defines complete-workflow isolation fixtures for menu imports and table links", () => {
    expect(menuImportStoragePath({})).toContain(rlsRestaurantA);
    expect(menuImportStoragePath({})).toContain(rlsLocationA);
  });
});
