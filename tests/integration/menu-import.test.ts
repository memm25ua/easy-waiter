import { describe, expect, it } from "vitest";
import { createMenuImport } from "$lib/server/menu-import";
import { demoStaff } from "$lib/server/demo-data";

describe("menu import contract", () => {
  it("creates a draft with confidence flags and suggestions", async () => {
    const draft = await createMenuImport(demoStaff, "menu.pdf");
    expect(draft.status).toBe("needs_review");
    expect(draft.confidenceSummary.length).toBeGreaterThan(0);
    expect(draft.menu.sections[0].items[0].suggestions?.length).toBeGreaterThan(
      0,
    );
  });
});
