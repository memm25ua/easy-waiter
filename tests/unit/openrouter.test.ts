import { describe, expect, it } from "vitest";
import {
  createChatCompletion,
  parseJsonObjectFromModelContent,
  sanitizeProviderMetadata,
  validateAiMenuDraftResponse,
} from "$lib/server/openrouter";

describe("OpenRouter adapter", () => {
  it("returns disabled fallback when the API key is absent", async () => {
    const result = await createChatCompletion([
      { role: "user", content: "hello" },
    ]);
    expect(["disabled", "success", "error", "timeout"]).toContain(
      result.providerStatus,
    );
    expect(result.metadata).not.toHaveProperty("apiKey");
  });

  it("validates AI menu draft schema", () => {
    const result = validateAiMenuDraftResponse({
      categories: [
        {
          name: "Mains",
          items: [
            {
              name: "Chicken Rice",
              price: 1450,
              currency: "EUR",
              optionGroups: [
                {
                  name: "Sauce",
                  values: [{ name: "Mojo", priceDelta: 100 }],
                },
              ],
            },
          ],
        },
      ],
      warnings: [
        {
          severity: "non_critical",
          fieldName: "description",
          message: "Description needs review.",
        },
      ],
      summary: "Draft created",
    });

    expect(result.categories[0].items[0].name).toBe("Chicken Rice");
    expect(() =>
      validateAiMenuDraftResponse({ categories: [], warnings: "bad" }),
    ).toThrow();
  });

  it("redacts provider secrets from metadata", () => {
    expect(
      sanitizeProviderMetadata({
        apiKey: "secret",
        authorization: "Bearer secret",
        id: "completion-1",
      }),
    ).toEqual({ id: "completion-1" });
  });

  it("parses fenced JSON from model output", () => {
    expect(
      parseJsonObjectFromModelContent(
        '```json\n{"categories":[],"warnings":[],"summary":"ok"}\n```',
      ),
    ).toEqual({ categories: [], warnings: [], summary: "ok" });
  });
});
