import { describe, expect, it } from "vitest";
import {
  buildPublishedMenuSnapshotPayload,
  detectMenuVersionConflict,
  getNextMenuVersion,
  hasOpenCriticalImportWarnings,
  validateDraftVersionForSave,
  validateImportWarningsForPublish,
  validateMenuForPublish,
} from "$lib/menu-publish";
import { demoMenu } from "$lib/server/demo-data";
import type { ImportWarning } from "$lib/types";

describe("menu publish gate", () => {
  it("allows valid menus", () => {
    expect(validateMenuForPublish(demoMenu).canPublish).toBe(true);
  });

  it("blocks unresolved flags and invalid prices", () => {
    const menu = structuredClone(demoMenu);
    menu.sections[0].items[0].confidenceFlags = ["price"];
    menu.sections[0].items[1].price = -1;
    const result = validateMenuForPublish(menu);
    expect(result.canPublish).toBe(false);
    expect(result.issues.join(" ")).toContain("unresolved");
    expect(result.issues.join(" ")).toContain("negative");
  });

  it("blocks open critical import warnings and allows non-critical warnings", () => {
    const warnings: ImportWarning[] = [
      {
        id: "warning-critical",
        menuImportJobId: "job-1",
        menuDraftId: "menu-1",
        targetType: "item",
        targetId: "item-1",
        severity: "critical",
        fieldName: "price",
        message: "Confirm price before publishing.",
        sourceExcerpt: "Chicken rice 14?",
        status: "open",
        createdAt: new Date().toISOString(),
      },
      {
        id: "warning-note",
        menuImportJobId: "job-1",
        menuDraftId: "menu-1",
        targetType: "category",
        targetId: "section-1",
        severity: "non_critical",
        fieldName: "name",
        message: "Review category grouping.",
        sourceExcerpt: "Mains",
        status: "open",
        createdAt: new Date().toISOString(),
      },
    ];

    expect(hasOpenCriticalImportWarnings(warnings)).toBe(true);
    expect(validateImportWarningsForPublish(warnings).canPublish).toBe(false);
    expect(
      validateImportWarningsForPublish([
        { ...warnings[0], status: "resolved" },
        warnings[1],
      ]).canPublish,
    ).toBe(true);
  });

  it("detects stale menu versions before overwrite", () => {
    expect(detectMenuVersionConflict(2, 3)).toBe(true);
    expect(detectMenuVersionConflict(3, 3)).toBe(false);
  });

  it("increments draft versions and returns reviewable conflicts", () => {
    expect(getNextMenuVersion(3)).toBe(4);
    expect(validateDraftVersionForSave(3, 3)).toEqual({
      ok: true,
      nextVersion: 4,
    });
    expect(validateDraftVersionForSave(2, 3)).toEqual({
      ok: false,
      conflict: {
        lastSeenVersion: 2,
        currentVersion: 3,
      },
    });
  });

  it("builds published snapshots from reviewed menu versions", () => {
    const menu = structuredClone(demoMenu);
    menu.status = "draft";
    menu.currentVersion = 4;
    const snapshot = buildPublishedMenuSnapshotPayload(menu);

    expect(snapshot.status).toBe("published");
    expect(snapshot.currentVersion).toBe(4);
    expect(snapshot.sections[0].items[0].name).toBe("Tomato Toast");
  });
});
