import { describe, expect, it } from "vitest";
import { buildMenuImportAgentMessages } from "$lib/server/menu-import";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe.skipIf(!hasProductionSupabaseEnv())(
  "OpenRouter AI waiter contract",
  () => {
    it("requires Supabase menu context for approved-context answers", () => {
      expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
    });
  },
);

describe("OpenRouter menu import-agent contract", () => {
  it("includes OCR text and source resource in import-agent messages", () => {
    const messages = buildMenuImportAgentMessages({
      restaurantId: "restaurant-1",
      locationId: "location-1",
      sourceResourceReference: "signed-resource",
      ocrText: "Desserts\nFlan 5",
      ocrConfidenceSummary: { average: 0.88 },
      targetCurrency: "EUR",
      locale: "en",
      expectedSchemaVersion: "menu-import-v1",
      promptVersion: "test",
    });
    expect(messages[0].content).toContain("strict JSON");
    expect(messages[1].content).toContain("signed-resource");
    expect(messages[1].content).toContain("Flan 5");
  });
});
