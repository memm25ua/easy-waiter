import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { t } from "$lib/i18n";
import { completeRestaurantOnboarding } from "$lib/server/onboarding";
import { requireAccount } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.staff) throw redirect(303, "/manager");
  await requireAccount(locals);
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const user = await requireAccount(locals);
    const form = await request.formData();
    try {
      await completeRestaurantOnboarding({
        user,
        restaurantName: String(form.get("restaurantName") ?? ""),
        locationName: String(form.get("locationName") ?? ""),
        timezone: String(form.get("timezone") ?? "Europe/Madrid"),
        currency: String(form.get("currency") ?? "EUR"),
      });
    } catch (error) {
      const locale = locals.locale ?? "en";
      return fail(400, {
        message:
          error instanceof Error
            ? error.message
            : t(locale, "auth.onboardingFailed"),
      });
    }
    throw redirect(303, "/manager");
  },
};
