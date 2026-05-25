import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { t } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.staff) throw redirect(303, "/manager");
  return { next: url.searchParams.get("next") ?? "/manager" };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.supabase)
      return fail(500, {
        message: t(locals.locale ?? "en", "auth.supabaseMissing"),
      });
    const form = await request.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const { error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return fail(400, { message: error.message, email });
    const next = String(form.get("next") || "/manager");
    throw redirect(303, next.startsWith("/") ? next : "/manager");
  },
};
