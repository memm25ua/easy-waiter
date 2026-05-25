import { getManagerMenu } from "./menu";
import { createServiceRoleClient } from "./supabase";
import type { MenuImportDraft, StaffAssignment } from "$lib/types";

export async function createMenuImport(
  staff: StaffAssignment,
  fileName: string,
): Promise<MenuImportDraft> {
  const client = createServiceRoleClient();
  const { data: importRow, error: importError } = await client
    .from("menu_imports")
    .insert({
      location_id: staff.locationId,
      uploaded_by: staff.id,
      source_file_path: `menu-imports/${staff.locationId}/${fileName || "uploaded-menu.pdf"}`,
      status: "needs_review",
      confidence_summary: ["Review imported descriptions before publishing"],
    })
    .select(
      "id,location_id,status,source_file_path,confidence_summary,error_message",
    )
    .single();
  if (importError) throw importError;

  const { data: menuRow, error: menuError } = await client
    .from("menus")
    .insert({
      location_id: staff.locationId,
      title: fileName ? fileName.replace(/\.[^.]+$/, "") : "Imported menu",
      status: "draft",
      source_import_id: importRow.id,
    })
    .select("id")
    .single();
  if (menuError) throw menuError;

  const menu = await getManagerMenu(menuRow.id);
  if (!menu) throw new Error("Imported menu could not be loaded.");
  return {
    id: importRow.id,
    locationId: importRow.location_id,
    status: importRow.status,
    sourceFilePath: importRow.source_file_path,
    confidenceSummary: importRow.confidence_summary ?? [],
    errorMessage: importRow.error_message,
    menu,
  };
}

export async function getLatestMenuImport(
  locationId: string,
): Promise<MenuImportDraft | null> {
  const { data, error } = await createServiceRoleClient()
    .from("menu_imports")
    .select(
      "id,location_id,status,source_file_path,confidence_summary,error_message,menus(id)",
    )
    .eq("location_id", locationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const menus = Array.isArray(data.menus)
    ? data.menus
    : data.menus
      ? [data.menus]
      : [];
  const menu = menus[0]?.id ? await getManagerMenu(String(menus[0].id)) : null;
  if (!menu) return null;
  return {
    id: data.id,
    locationId: data.location_id,
    status: data.status,
    sourceFilePath: data.source_file_path,
    confidenceSummary: data.confidence_summary ?? [],
    errorMessage: data.error_message,
    menu,
  };
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
