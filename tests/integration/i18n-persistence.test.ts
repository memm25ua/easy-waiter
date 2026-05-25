import { describe, expect, it } from "vitest";
import { validateLead } from "$lib/server/marketing-leads";
import type { AiActionAudit, LanguagePreference } from "$lib/types";

describe("i18n persistence contracts", () => {
  it("keeps locale on marketing leads", () => {
    expect(
      validateLead({ email: "owner@example.com", locale: "es" }).locale,
    ).toBe("es");
  });

  it("models language preference and AI audit locale", () => {
    const preference: LanguagePreference = {
      id: "pref",
      accountId: "account",
      locale: "es",
      source: "explicit",
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    };
    const audit = { locale: "es" } as AiActionAudit;
    expect(preference.locale).toBe("es");
    expect(audit.locale).toBe("es");
  });
});
