import { describe, expect, it } from "vitest";
import {
  hasProductionSupabaseEnv,
  requireProductionSupabaseEnv,
} from "../setup/production-env";

describe("Supabase production environment guard", () => {
  it("reports missing production test configuration", () => {
    if (hasProductionSupabaseEnv()) {
      expect(() => requireProductionSupabaseEnv()).not.toThrow();
    } else {
      expect(() => requireProductionSupabaseEnv()).toThrow(/Missing Supabase/);
    }
  });
});
