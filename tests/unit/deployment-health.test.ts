import { describe, expect, it } from "vitest";
import {
  evaluateDeploymentHealth,
  getProductionMetadata,
} from "$lib/server/deployment-health";

describe("deployment health", () => {
  it("returns safe check names and private route metadata", () => {
    const metadata = getProductionMetadata();
    const health = evaluateDeploymentHealth();
    expect(metadata.privateRoutePrefixes).toContain("/manager");
    expect(health.checks.map((check) => check.name)).toContain(
      "server secrets",
    );
  });
});
