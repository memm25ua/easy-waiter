import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { t } from "$lib/i18n";
import { createMarketingLead } from "$lib/server/marketing-leads";
import { getProductionMetadata } from "$lib/server/deployment-health";

export const load: PageServerLoad = async ({ locals }) => {
  const metadata = getProductionMetadata();
  return {
    staff: locals.staff,
    metadata,
  };
};

export const actions: Actions = {
  lead: async ({ request, locals }) => {
    const form = await request.formData();
    const locale = locals.locale ?? "en";
    try {
      await createMarketingLead({
        email: String(form.get("email") ?? ""),
        restaurantName: String(form.get("restaurantName") ?? ""),
        contactName: String(form.get("contactName") ?? ""),
        message: String(form.get("message") ?? ""),
        locale,
      });
      return { message: t(locale, "lead.success") };
    } catch (error) {
      return fail(400, {
        leadError:
          error instanceof Error ? error.message : t(locale, "lead.error"),
      });
    }
  },
};
