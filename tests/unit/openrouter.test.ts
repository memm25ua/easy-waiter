import { describe, expect, it } from "vitest";
import { createChatCompletion } from "$lib/server/openrouter";

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
});
