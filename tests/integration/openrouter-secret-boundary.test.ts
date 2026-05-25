import { describe, expect, it } from "vitest";
import { evaluateDeploymentHealth } from "$lib/server/deployment-health";

describe("OpenRouter secret boundary", () => {
  it("does not expose secret values in health payloads", () => {
    const payload = JSON.stringify(evaluateDeploymentHealth());
    expect(payload).not.toContain("OPENROUTER_API_KEY=");
    expect(payload).not.toContain("sk-");
  });
});
