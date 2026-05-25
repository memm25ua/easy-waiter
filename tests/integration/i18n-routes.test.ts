import { describe, expect, it } from "vitest";
import { evaluateDeploymentHealth } from "$lib/server/deployment-health";
import { resolveLocale, t } from "$lib/i18n";

describe("i18n route-facing behavior", () => {
  it("uses browser locale defaults for route copy", () => {
    expect(resolveLocale({ browser: "es-ES" })).toBe("es");
    expect(resolveLocale({ browser: "en-US" })).toBe("en");
    expect(resolveLocale({ browser: "ca-ES" })).toBe("en");
  });

  it("localizes health check labels without exposing secrets", () => {
    const health = evaluateDeploymentHealth("es");
    expect(health.checks.map((check) => check.name)).toContain(
      t("es", "health.serverSecrets"),
    );
    expect(JSON.stringify(health)).not.toContain("OPENROUTER_API_KEY");
    expect(JSON.stringify(health)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
