import { getManagerMenu } from "./menu";
import {
  buildMenuImportResourcePath,
  createMenuImportResourceReference,
  createServiceRoleClient,
  uploadMenuImportResource,
} from "./supabase";
import type {
  ImportWarningSeverity,
  MenuImportDraft,
  StaffAssignment,
  SupportedLocale,
} from "$lib/types";

export interface MenuImportAgentInput {
  restaurantId: string;
  locationId: string;
  sourceResourceReference: string;
  ocrText: string;
  ocrConfidenceSummary: Record<string, unknown>;
  targetCurrency: string;
  locale: SupportedLocale;
  expectedSchemaVersion: string;
  promptVersion: string;
}

export const SUPPORTED_MENU_IMPORT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const MAX_MENU_IMPORT_BYTES = 15 * 1024 * 1024;

export function validateMenuImportFile(input: {
  name: string;
  type: string;
  size: number;
}) {
  if (!input.name || input.size <= 0) {
    return "Choose a menu PDF or image.";
  }
  if (input.size > MAX_MENU_IMPORT_BYTES) {
    return "Menu file is too large.";
  }
  if (!SUPPORTED_MENU_IMPORT_TYPES.includes(input.type)) {
    return "Upload a PDF, PNG, JPG, or WebP menu.";
  }
  return null;
}

export function normalizeOcrText(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function classifyImportWarningSeverity(input: {
  fieldName: string;
  message: string;
}): ImportWarningSeverity {
  const value = `${input.fieldName} ${input.message}`.toLowerCase();
  if (
    value.includes("price") ||
    value.includes("currency") ||
    value.includes("required option") ||
    value.includes("allergen") ||
    value.includes("safety") ||
    value.includes("item name")
  ) {
    return "critical";
  }
  return "non_critical";
}

export function buildMenuImportAgentMessages(input: MenuImportAgentInput) {
  return [
    {
      role: "system" as const,
      content:
        "Convert a restaurant menu source into strict JSON. Use only the uploaded resource and OCR text. Return categories, items, option groups, option values, warnings, and summary. Mark ordering-critical uncertainty as critical.",
    },
    {
      role: "user" as const,
      content: JSON.stringify({
        restaurant_id: input.restaurantId,
        location_id: input.locationId,
        source_resource_reference: input.sourceResourceReference,
        ocr_text: normalizeOcrText(input.ocrText),
        ocr_confidence_summary: input.ocrConfidenceSummary,
        target_currency: input.targetCurrency,
        locale: input.locale,
        expected_schema_version: input.expectedSchemaVersion,
        prompt_version: input.promptVersion,
      }),
    },
  ];
}

export async function createMenuImportJob(input: {
  staff: StaffAssignment;
  file: File;
}) {
  const validationMessage = validateMenuImportFile(input.file);
  if (validationMessage) throw new Error(validationMessage);

  const client = createServiceRoleClient();
  const { data: importRow, error: importError } = await client
    .from("menu_imports")
    .insert({
      restaurant_id: input.staff.restaurantId,
      location_id: input.staff.locationId,
      uploaded_by: input.staff.id,
      source_file_path: "pending",
      source_file_name: input.file.name,
      source_file_type: input.file.name.split(".").pop()?.toLowerCase() ?? "",
      source_file_size: input.file.size,
      status: "uploaded",
    })
    .select("id")
    .single();
  if (importError) throw importError;

  const path = buildMenuImportResourcePath({
    restaurantId: input.staff.restaurantId,
    locationId: input.staff.locationId,
    importJobId: importRow.id,
    fileName: input.file.name,
  });

  await uploadMenuImportResource({
    path,
    body: await input.file.arrayBuffer(),
    contentType: input.file.type,
  });

  const { data, error } = await client
    .from("menu_imports")
    .update({ source_file_path: path })
    .eq("id", importRow.id)
    .select("id,source_file_path,status")
    .single();
  if (error) throw error;
  return data;
}

export async function processMenuImportJob(input: {
  menuImportJobId: string;
  restaurantId: string;
  locationId: string;
  ocrText: string;
  ocrConfidenceSummary?: Record<string, unknown>;
  targetCurrency: string;
  locale: SupportedLocale;
}) {
  const client = createServiceRoleClient();
  const normalizedOcrText = normalizeOcrText(input.ocrText);
  const { data: job, error: loadError } = await client
    .from("menu_imports")
    .select("id,source_file_path")
    .eq("id", input.menuImportJobId)
    .eq("restaurant_id", input.restaurantId)
    .eq("location_id", input.locationId)
    .single();
  if (loadError) throw loadError;

  const resourceReference = await createMenuImportResourceReference(
    job.source_file_path,
  );
  const messages = buildMenuImportAgentMessages({
    restaurantId: input.restaurantId,
    locationId: input.locationId,
    sourceResourceReference: resourceReference,
    ocrText: normalizedOcrText,
    ocrConfidenceSummary: input.ocrConfidenceSummary ?? {},
    targetCurrency: input.targetCurrency,
    locale: input.locale,
    expectedSchemaVersion: "menu-import-v1",
    promptVersion: "2026-05-26",
  });

  const { error } = await client
    .from("menu_imports")
    .update({
      status: "ai_processing",
      ocr_text: normalizedOcrText,
      ocr_confidence_summary: input.ocrConfidenceSummary ?? {},
      ai_resource_reference: resourceReference,
      ai_prompt_version: "2026-05-26",
    })
    .eq("id", input.menuImportJobId);
  if (error) throw error;

  return { messages, resourceReference, ocrText: normalizedOcrText };
}

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

export async function listImportWarnings(menuId: string) {
  const { data, error } = await createServiceRoleClient()
    .from("import_warnings")
    .select(
      "id,menu_import_id,menu_id,target_type,target_id,severity,field_name,message,source_excerpt,status,created_at,resolved_by,resolved_at",
    )
    .eq("menu_id", menuId)
    .order("severity", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((warning) => ({
    id: warning.id,
    menuImportJobId: warning.menu_import_id,
    menuDraftId: warning.menu_id,
    targetType: warning.target_type,
    targetId: warning.target_id,
    severity: warning.severity,
    fieldName: warning.field_name,
    message: warning.message,
    sourceExcerpt: warning.source_excerpt,
    status: warning.status,
    createdAt: warning.created_at,
    resolvedByAccountId: warning.resolved_by,
    resolvedAt: warning.resolved_at,
  }));
}

export async function resolveImportWarning(input: {
  warningId: string;
  staffId: string;
  action: "resolved" | "accepted";
}) {
  const { data, error } = await createServiceRoleClient()
    .from("import_warnings")
    .update({
      status: input.action,
      resolved_by: input.staffId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", input.warningId)
    .select("id,status")
    .single();
  if (error) throw error;
  return data;
}
