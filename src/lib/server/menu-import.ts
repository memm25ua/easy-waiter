import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { createMenuDraftFromAiImport, getManagerMenu } from "./menu";
import {
  createChatCompletion,
  parseJsonObjectFromModelContent,
  sanitizeProviderMetadata,
  validateAiMenuDraftResponse,
} from "./openrouter";
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
const IMPORT_PROMPT_VERSION = "2026-05-26";

export interface MenuOcrResult {
  text: string;
  confidenceSummary: Record<string, unknown>;
}

function logImport(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown>,
) {
  console[level](
    JSON.stringify({
      area: "menu-import",
      event,
      ...details,
    }),
  );
}

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
        "Convert a restaurant menu source into strict JSON. Use only the uploaded resource and OCR text. Return categories with items. Each item may include optionGroups with values for modifiers or choices. Return warnings and summary. Prices and priceDelta values must be minor currency units when possible. Mark ordering-critical uncertainty as critical.",
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

function getSupabaseFunctionUrl(functionName: string) {
  const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!supabaseUrl) {
    throw new Error("Supabase URL is required for menu import processing.");
  }
  return `${supabaseUrl}/functions/v1/${functionName}`;
}

export async function runMenuOcr(input: {
  menuImportJobId: string;
  restaurantId: string;
  locationId: string;
  locale: SupportedLocale;
}): Promise<MenuOcrResult> {
  const serviceRoleKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for OCR.");
  }

  logImport("info", "ocr.invoke.start", {
    menuImportJobId: input.menuImportJobId,
    restaurantId: input.restaurantId,
    locationId: input.locationId,
    locale: input.locale,
  });
  const response = await fetch(getSupabaseFunctionUrl("menu-ocr"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      menuImportJobId: input.menuImportJobId,
      restaurantId: input.restaurantId,
      locationId: input.locationId,
      locale: input.locale,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    status?: string;
    text?: string;
    confidenceSummary?: Record<string, unknown>;
    message?: string;
    error?: string;
  };
  if (!response.ok || payload.status === "failed") {
    logImport("error", "ocr.invoke.failed", {
      menuImportJobId: input.menuImportJobId,
      status: response.status,
      message: payload.message ?? payload.error,
    });
    throw new Error(
      payload.message ??
        payload.error ??
        "Menu text extraction could not be completed.",
    );
  }
  const text = normalizeOcrText(String(payload.text ?? ""));
  if (!text) {
    logImport("error", "ocr.invoke.empty_text", {
      menuImportJobId: input.menuImportJobId,
      status: response.status,
    });
    throw new Error("Menu text extraction did not find readable text.");
  }
  logImport("info", "ocr.invoke.success", {
    menuImportJobId: input.menuImportJobId,
    status: response.status,
    textLength: text.length,
    confidenceSummary: payload.confidenceSummary ?? {},
  });
  return {
    text,
    confidenceSummary: payload.confidenceSummary ?? {},
  };
}

async function markMenuImportFailed(input: {
  menuImportJobId: string;
  message: string;
}) {
  const { error } = await createServiceRoleClient()
    .from("menu_imports")
    .update({
      status: "failed",
      error_message: input.message,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.menuImportJobId);
  if (error) throw error;
}

export async function createMenuImportJob(input: {
  staff: StaffAssignment;
  file: File;
}) {
  const validationMessage = validateMenuImportFile(input.file);
  if (validationMessage) throw new Error(validationMessage);

  logImport("info", "job.create.start", {
    restaurantId: input.staff.restaurantId,
    locationId: input.staff.locationId,
    staffId: input.staff.id,
    fileName: input.file.name,
    fileType: input.file.type,
    fileSize: input.file.size,
  });
  const client = createServiceRoleClient();
  const { data: importRow, error: importError } = await client
    .from("menu_imports")
    .insert({
      restaurant_id: input.staff.restaurantId,
      location_id: input.staff.locationId,
      uploaded_by: input.staff.id,
      source_file_path: "pending",
      source_file_name: input.file.name,
      source_file_type: input.file.type,
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
  logImport("info", "job.storage.uploaded", {
    menuImportJobId: importRow.id,
    fileName: input.file.name,
    fileType: input.file.type,
    fileSize: input.file.size,
  });

  const { data, error } = await client
    .from("menu_imports")
    .update({ source_file_path: path })
    .eq("id", importRow.id)
    .select("id,source_file_path,status")
    .single();
  if (error) throw error;
  logImport("info", "job.create.success", {
    menuImportJobId: data.id,
    status: data.status,
  });
  return data;
}

export async function processMenuImportJob(input: {
  menuImportJobId: string;
  restaurantId: string;
  locationId: string;
  targetCurrency: string;
  locale: SupportedLocale;
}): Promise<{
  status: "review_ready" | "failed";
  menuId?: string;
  message: string;
}> {
  const client = createServiceRoleClient();
  logImport("info", "job.process.start", {
    menuImportJobId: input.menuImportJobId,
    restaurantId: input.restaurantId,
    locationId: input.locationId,
    targetCurrency: input.targetCurrency,
    locale: input.locale,
  });
  const { data: job, error: loadError } = await client
    .from("menu_imports")
    .select("id,source_file_path,source_file_name,source_file_type")
    .eq("id", input.menuImportJobId)
    .eq("restaurant_id", input.restaurantId)
    .eq("location_id", input.locationId)
    .single();
  if (loadError) throw loadError;

  try {
    const ocr = await runMenuOcr({
      menuImportJobId: input.menuImportJobId,
      restaurantId: input.restaurantId,
      locationId: input.locationId,
      locale: input.locale,
    });
    const resourceReference = await createMenuImportResourceReference(
      job.source_file_path,
    );
    const messages = buildMenuImportAgentMessages({
      restaurantId: input.restaurantId,
      locationId: input.locationId,
      sourceResourceReference: resourceReference,
      ocrText: ocr.text,
      ocrConfidenceSummary: ocr.confidenceSummary,
      targetCurrency: input.targetCurrency,
      locale: input.locale,
      expectedSchemaVersion: "menu-import-v1",
      promptVersion: IMPORT_PROMPT_VERSION,
    });

    const { error: processingError } = await client
      .from("menu_imports")
      .update({
        status: "ai_processing",
        ocr_text: ocr.text,
        ocr_confidence_summary: ocr.confidenceSummary,
        ai_resource_reference: resourceReference,
        ai_prompt_version: IMPORT_PROMPT_VERSION,
      })
      .eq("id", input.menuImportJobId);
    if (processingError) throw processingError;

    const provider = await createChatCompletion(messages);
    logImport(
      provider.providerStatus === "success" ? "info" : "error",
      "ai.provider.result",
      {
        menuImportJobId: input.menuImportJobId,
        providerStatus: provider.providerStatus,
        model: provider.model,
        metadata: sanitizeProviderMetadata(provider.metadata),
        contentLength: provider.content.length,
      },
    );
    if (provider.providerStatus !== "success") {
      throw new Error(
        provider.providerStatus === "timeout"
          ? "AI menu extraction is taking longer than expected. Try again in a moment."
          : "AI menu extraction is unavailable right now.",
      );
    }
    const draft = validateAiMenuDraftResponse(
      parseJsonObjectFromModelContent(provider.content),
    );
    logImport("info", "ai.schema.valid", {
      menuImportJobId: input.menuImportJobId,
      categories: draft.categories.length,
      warnings: draft.warnings.length,
    });
    const menu = await createMenuDraftFromAiImport({
      locationId: input.locationId,
      restaurantId: input.restaurantId,
      importJobId: input.menuImportJobId,
      title: job.source_file_name
        ? job.source_file_name.replace(/\.[^.]+$/, "")
        : "Imported menu",
      currency: input.targetCurrency,
      draft,
    });
    const safeMetadata = sanitizeProviderMetadata(provider.metadata);
    const { error: completeError } = await client
      .from("menu_imports")
      .update({
        status: "review_ready",
        ai_model: provider.model,
        ai_response_summary: {
          providerStatus: provider.providerStatus,
          metadata: safeMetadata,
          summary: draft.summary,
          categories: draft.categories.length,
          warnings: draft.warnings.length,
        },
        confidence_summary: [
          draft.summary || "Review imported menu before publishing.",
        ],
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", input.menuImportJobId);
    if (completeError) throw completeError;
    logImport("info", "job.process.success", {
      menuImportJobId: input.menuImportJobId,
      menuId: menu.id,
      categories: draft.categories.length,
      warnings: draft.warnings.length,
    });
    return {
      status: "review_ready",
      menuId: menu.id,
      message: "Menu draft is ready for review.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Menu import could not be completed.";
    await markMenuImportFailed({
      menuImportJobId: input.menuImportJobId,
      message,
    });
    logImport("error", "job.process.failed", {
      menuImportJobId: input.menuImportJobId,
      message,
    });
    return { status: "failed", message };
  }
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
