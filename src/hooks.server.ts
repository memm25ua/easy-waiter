import type { Handle } from "@sveltejs/kit";
import { localeCookieName, resolveLocale } from "$lib/i18n";
import { loadRequestContext } from "$lib/server/auth";
import {
  createSupabaseServerClient,
  hasSupabasePublicConfig,
} from "$lib/server/supabase";

export const handle: Handle = async ({ event, resolve }) => {
  const explicitLocale = event.url.searchParams.get("lang");
  const persistedLocale = event.cookies.get(localeCookieName);
  const browserLocale = event.request.headers.get("accept-language");
  event.locals.locale = resolveLocale({
    explicit: explicitLocale,
    persisted: persistedLocale,
    browser: browserLocale,
  });

  if (explicitLocale) {
    event.cookies.set(localeCookieName, event.locals.locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  if (hasSupabasePublicConfig()) {
    event.locals.supabase = createSupabaseServerClient(event.cookies);
    await loadRequestContext(event.locals);
    if (!explicitLocale && !persistedLocale && event.locals.account) {
      const { data } = await event.locals.supabase
        .from("accounts")
        .select("preferred_locale")
        .eq("id", event.locals.account.id)
        .maybeSingle();
      event.locals.locale = resolveLocale({
        persisted: data?.preferred_locale,
        browser: browserLocale,
      });
    }
  } else {
    event.locals.session = null;
    event.locals.account = null;
    event.locals.staff = null;
  }

  if (explicitLocale && event.locals.supabase && event.locals.account) {
    await event.locals.supabase
      .from("accounts")
      .update({ preferred_locale: event.locals.locale })
      .eq("id", event.locals.account.id);
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};
