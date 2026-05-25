import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("deployment documentation", () => {
  it("contains launch blockers and rollback guidance", () => {
    const guide = readFileSync("docs/deployment.md", "utf8");
    expect(guide).toContain("Launch Blockers");
    expect(guide).toContain("Rollback");
    expect(guide).toContain("OPENROUTER_API_KEY");
  });
});
