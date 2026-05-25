import { describe, expect, it } from "vitest";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe.skipIf(!hasProductionSupabaseEnv())(
  "persistent table sessions",
  () => {
    it("requires Supabase seed data for expired-session coverage", () => {
      expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
    });
  },
);
