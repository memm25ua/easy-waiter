import { describe, expect, it } from "vitest";
import {
  buildMenuImportAgentMessages,
  classifyImportWarningSeverity,
  normalizeOcrText,
} from "$lib/server/menu-import";
import { restaurantA, productionOwner } from "../fixtures/production";

describe("menu import helpers", () => {
  it("normalizes OCR text while preserving line boundaries", () => {
    expect(normalizeOcrText("  Mains   \r\n Chicken   Rice  14.50  \n\n")).toBe(
      "Mains\nChicken Rice 14.50",
    );
  });

  it("classifies ordering-critical warnings as critical", () => {
    expect(
      classifyImportWarningSeverity({
        fieldName: "price",
        message: "Ambiguous price for orderable item.",
      }),
    ).toBe("critical");
    expect(
      classifyImportWarningSeverity({
        fieldName: "description",
        message: "Optional description was low confidence.",
      }),
    ).toBe("non_critical");
  });

  it("passes OCR text and source resource reference to the AI import agent", () => {
    const messages = buildMenuImportAgentMessages({
      restaurantId: restaurantA.id,
      locationId: productionOwner.locationId,
      sourceResourceReference: "signed-resource",
      ocrText: " Chicken   Rice  14.50 ",
      ocrConfidenceSummary: { average: 0.82 },
      targetCurrency: "EUR",
      locale: "en",
      expectedSchemaVersion: "menu-import-v1",
      promptVersion: "2026-05-26",
    });

    const payload = JSON.parse(messages[1].content);
    expect(payload.source_resource_reference).toBe("signed-resource");
    expect(payload.ocr_text).toBe("Chicken Rice 14.50");
    expect(payload.target_currency).toBe("EUR");
  });
});
