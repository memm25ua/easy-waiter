import { demoMenu } from "./demo-data";
import type { MenuImportDraft, StaffAssignment } from "$lib/types";

let latestImport: MenuImportDraft | null = null;

export async function createMenuImport(
  staff: StaffAssignment,
  fileName: string,
): Promise<MenuImportDraft> {
  const draft = structuredClone(demoMenu);
  draft.id = `menu-import-${Date.now()}`;
  draft.status = "draft";
  draft.publishedAt = null;
  draft.sections[0].items[0].confidenceFlags = ["description"];
  draft.sections[0].items[0].suggestions = [
    "Make the tomato toast description more specific.",
  ];

  latestImport = {
    id: `import-${Date.now()}`,
    locationId: staff.locationId,
    status: "needs_review",
    sourceFilePath: `menu-imports/${staff.locationId}/${fileName || "uploaded-menu.pdf"}`,
    confidenceSummary: ["1 item description needs review"],
    errorMessage: null,
    menu: draft,
  };

  return structuredClone(latestImport);
}

export async function getLatestMenuImport(
  locationId: string,
): Promise<MenuImportDraft | null> {
  if (!latestImport || latestImport.locationId !== locationId) return null;
  return structuredClone(latestImport);
}

export function resolveImportFlags(draft: MenuImportDraft): MenuImportDraft {
  const next = structuredClone(draft);
  for (const section of next.menu.sections) {
    for (const item of section.items) item.confidenceFlags = [];
  }
  next.status = "approved";
  next.confidenceSummary = [];
  return next;
}
