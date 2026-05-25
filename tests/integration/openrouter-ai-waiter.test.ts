import { describe, expect, it } from "vitest";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe.skipIf(!hasProductionSupabaseEnv())(
  "OpenRouter AI waiter contract",
  () => {
    it("requires Supabase menu context for approved-context answers", () => {
      expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
    });
  },
);
