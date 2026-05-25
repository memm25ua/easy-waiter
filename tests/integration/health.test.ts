import { describe, expect, it } from "vitest";
import { evaluateDeploymentHealth } from "$lib/server/deployment-health";

describe("health route contract", () => {
  it("reports status without secret values", () => {
    const health = evaluateDeploymentHealth();
    expect(health).toHaveProperty("ok");
    expect(JSON.stringify(health)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
