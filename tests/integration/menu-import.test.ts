import { describe, expect, it } from "vitest";
import {
  createMenuImportJob,
  buildMenuImportAgentMessages,
  createMenuImport,
  normalizeOcrText,
  processMenuImportJob,
  validateMenuImportFile,
} from "$lib/server/menu-import";
import { validateAiMenuDraftResponse } from "$lib/server/openrouter";
import { demoStaff } from "$lib/server/demo-data";
import { hasProductionSupabaseEnv } from "../setup/production-env";
import {
  representativeImageMenu,
  representativePdfMenu,
} from "../fixtures/menu-import-files";

describe("menu import contract helpers", () => {
  it("accepts representative PDF and image metadata", () => {
    expect(representativePdfMenu.fileType).toBe("pdf");
    expect(representativeImageMenu.mimeType).toBe("image/jpeg");
  });

  it("exposes import job creation and processing contracts", () => {
    expect(createMenuImportJob).toBeTypeOf("function");
    expect(processMenuImportJob).toBeTypeOf("function");
  });

  it("builds import-agent payload with OCR text and source resource", () => {
    const messages = buildMenuImportAgentMessages({
      restaurantId: demoStaff.restaurantId,
      locationId: demoStaff.locationId,
      sourceResourceReference: "resource-url",
      ocrText: normalizeOcrText("Tapas\nPatatas 6.50"),
      ocrConfidenceSummary: { average: 0.9 },
      targetCurrency: demoStaff.currency,
      locale: "en",
      expectedSchemaVersion: "menu-import-v1",
      promptVersion: "test",
    });
    const payload = JSON.parse(messages[1].content);
    expect(payload.source_resource_reference).toBe("resource-url");
    expect(payload.ocr_text).toContain("Patatas");
  });

  it("fails safely for unsupported files and invalid AI schema", () => {
    expect(
      validateMenuImportFile({
        name: "menu.txt",
        type: "text/plain",
        size: 10,
      }),
    ).toContain("Upload a PDF");
    expect(() =>
      validateAiMenuDraftResponse({ categories: [], warnings: "invalid" }),
    ).toThrow();
  });
});

describe.skipIf(!hasProductionSupabaseEnv())("menu import contract", () => {
  it("creates a draft with confidence flags and suggestions", async () => {
    const draft = await createMenuImport(demoStaff, "menu.pdf");
    expect(draft.status).toBe("needs_review");
    expect(draft.confidenceSummary.length).toBeGreaterThan(0);
    expect(draft.menu.sections[0].items[0].suggestions?.length).toBeGreaterThan(
      0,
    );
  });
});
