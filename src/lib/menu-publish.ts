import type { ImportWarning, Menu } from "./types";

export const CRITICAL_IMPORT_WARNING = "critical";
export const NON_CRITICAL_IMPORT_WARNING = "non_critical";

export const MENU_IMPORT_STATUSES = [
  "uploaded",
  "ocr_processing",
  "ai_processing",
  "review_ready",
  "failed",
  "cancelled",
] as const;

export const MENU_DRAFT_STATUSES = [
  "draft",
  "review_ready",
  "ready_to_publish",
  "published",
  "archived",
] as const;

export const TABLE_SESSION_STATUSES = ["active", "closed", "expired"] as const;

export interface PublishGateResult {
  canPublish: boolean;
  issues: string[];
}

export function validateMenuForPublish(menu: Menu): PublishGateResult {
  const issues: string[] = [];

  if (!menu.title.trim()) issues.push("Menu title is required.");
  if (menu.sections.length === 0)
    issues.push("At least one section is required.");

  for (const section of menu.sections) {
    if (!section.name.trim()) issues.push("Every section needs a name.");
    for (const item of section.items) {
      if (!item.name.trim()) issues.push("Every item needs a name.");
      if (item.price < 0)
        issues.push(`${item.name || "Item"} cannot have a negative price.`);
      if (!item.currency.trim())
        issues.push(`${item.name || "Item"} needs a currency.`);
      if ((item.confidenceFlags ?? []).length > 0) {
        issues.push(`${item.name || "Item"} has unresolved import flags.`);
      }
    }
  }

  return { canPublish: issues.length === 0, issues };
}

export function hasOpenCriticalImportWarnings(warnings: ImportWarning[]) {
  return warnings.some(
    (warning) =>
      warning.severity === CRITICAL_IMPORT_WARNING && warning.status === "open",
  );
}

export function validateImportWarningsForPublish(
  warnings: ImportWarning[],
): PublishGateResult {
  const criticalWarnings = warnings.filter(
    (warning) =>
      warning.severity === CRITICAL_IMPORT_WARNING && warning.status === "open",
  );

  return {
    canPublish: criticalWarnings.length === 0,
    issues: criticalWarnings.map((warning) => warning.message),
  };
}

export function detectMenuVersionConflict(
  lastSeenVersion: number,
  currentVersion: number,
) {
  return lastSeenVersion < currentVersion;
}

export function getNextMenuVersion(currentVersion: number) {
  return Math.max(0, currentVersion) + 1;
}

export function validateDraftVersionForSave(
  lastSeenVersion: number,
  currentVersion: number,
):
  | { ok: true; nextVersion: number }
  | {
      ok: false;
      conflict: { lastSeenVersion: number; currentVersion: number };
    } {
  if (detectMenuVersionConflict(lastSeenVersion, currentVersion)) {
    return {
      ok: false,
      conflict: { lastSeenVersion, currentVersion },
    };
  }
  return { ok: true, nextVersion: getNextMenuVersion(currentVersion) };
}

export function buildPublishedMenuSnapshotPayload(menu: Menu): Menu {
  const snapshot = structuredClone(menu);
  snapshot.status = "published";
  snapshot.publishedAt = new Date().toISOString();
  return snapshot;
}
