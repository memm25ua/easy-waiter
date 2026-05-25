import type { SupportedLocale } from "$lib/types";
import en from "./dictionaries/en";
import es from "./dictionaries/es";

export const supportedLocales = ["en", "es"] as const;
export const defaultLocale: SupportedLocale = "en";
export const localeCookieName = "ew_locale";

const dictionaries = { en, es };

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;

export function normalizeLocale(
  value: string | null | undefined,
): SupportedLocale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  if (normalized === "es" || normalized.startsWith("es-")) return "es";
  return null;
}

export function localeFromAcceptLanguage(
  header: string | null | undefined,
): SupportedLocale | null {
  if (!header) return null;
  return (
    header
      .split(",")
      .map((part) => normalizeLocale(part.split(";")[0]))
      .find((locale): locale is SupportedLocale => Boolean(locale)) ?? null
  );
}

export function resolveLocale(input: {
  explicit?: string | null;
  persisted?: string | null;
  browser?: string | null;
}): SupportedLocale {
  return (
    normalizeLocale(input.explicit) ??
    normalizeLocale(input.persisted) ??
    localeFromAcceptLanguage(input.browser) ??
    defaultLocale
  );
}

export function getDictionary(locale: SupportedLocale): Dictionary {
  return dictionaries[locale] as Dictionary;
}

export function t(locale: SupportedLocale, key: TranslationKey): string {
  return getDictionary(locale)[key] ?? en[key] ?? key;
}

export function findMissingKeys(locale: SupportedLocale): TranslationKey[] {
  const dictionary = getDictionary(locale);
  return Object.keys(en).filter(
    (key) => !dictionary[key as TranslationKey],
  ) as TranslationKey[];
}
