import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { t } from "$lib/i18n";
import { completeRestaurantOnboarding } from "$lib/server/onboarding";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.staff) throw redirect(303, "/manager");
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.supabase)
      return fail(500, {
        message: t(locals.locale ?? "en", "auth.supabaseMissing"),
      });
    const locale = locals.locale ?? "en";
    const form = await request.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const restaurantName = String(form.get("restaurantName") ?? "");
    const locationName = String(form.get("locationName") ?? "");
    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("[sign-up] auth.signUp error:", error.message, error);
      return fail(400, {
        message: error.message,
        email,
        restaurantName,
        locationName,
      });
    }
    if (!data.user) {
      // Supabase returns null user (no error) when the email already exists —
      // anti-enumeration behaviour. Treat as "check your inbox".
      return fail(400, {
        message: t(locale, "auth.emailAlreadyRegistered"),
        email,
        restaurantName,
        locationName,
      });
    }
    try {
      await completeRestaurantOnboarding({
        user: data.user,
        restaurantName,
        locationName,
        timezone: String(form.get("timezone") ?? "Europe/Madrid"),
        currency: String(form.get("currency") ?? "EUR"),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[sign-up] onboarding failed:", message, err);
      return fail(400, {
        message,
        email,
        restaurantName,
        locationName,
      });
    }
    throw redirect(303, "/manager");
  },
};
