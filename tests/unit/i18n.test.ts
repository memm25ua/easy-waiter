import { describe, expect, it } from "vitest";
import {
  findMissingKeys,
  localeFromAcceptLanguage,
  normalizeLocale,
  resolveLocale,
  t,
} from "$lib/i18n";

describe("i18n locale resolution", () => {
  it("normalizes supported language tags", () => {
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("es-ES")).toBe("es");
    expect(normalizeLocale("fr-FR")).toBeNull();
  });

  it("resolves explicit choice before persisted and browser locales", () => {
    expect(
      resolveLocale({ explicit: "es", persisted: "en", browser: "en-US" }),
    ).toBe("es");
    expect(resolveLocale({ persisted: "es", browser: "en-US" })).toBe("es");
    expect(resolveLocale({ browser: "es-ES,fr;q=0.8" })).toBe("es");
    expect(resolveLocale({ browser: "fr-FR" })).toBe("en");
  });

  it("parses accept-language headers and falls back safely", () => {
    expect(localeFromAcceptLanguage("fr-FR,es;q=0.8")).toBe("es");
    expect(localeFromAcceptLanguage("de-DE")).toBeNull();
    expect(t("es", "nav.signIn")).toBe("Iniciar sesión");
  });

  it("keeps English and Spanish dictionaries aligned", () => {
    expect(findMissingKeys("en")).toEqual([]);
    expect(findMissingKeys("es")).toEqual([]);
  });
});
