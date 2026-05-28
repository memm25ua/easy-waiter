import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { t } from "$lib/i18n";

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
    const timezone = String(form.get("timezone") ?? "Europe/Madrid");
    const currency = String(form.get("currency") ?? "EUR");

    const origin = new URL(request.url).origin;
    const { error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        // Onboarding data stored in user metadata, completed after email confirmation
        data: {
          pending_restaurant_name: restaurantName,
          pending_location_name: locationName,
          pending_timezone: timezone,
          pending_currency: currency,
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
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

    // Supabase returns {user: null, error: null} for ALL signups when email
    // confirmation is enabled (anti-enumeration). Treat as success — check inbox.
    throw redirect(303, `/auth/check-email?email=${encodeURIComponent(email)}`);
  },
};
