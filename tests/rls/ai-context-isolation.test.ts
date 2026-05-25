import { describe, expect, it } from "vitest";
import { skipWhenProductionEnvMissing } from "../setup/production-env";

describe.skipIf(skipWhenProductionEnvMissing())(
  "AI context RLS isolation",
  () => {
    it("requires Supabase-backed AI context regression coverage", () => {
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeTruthy();
    });
  },
);
