import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { t } from "$lib/i18n";
import { acceptStaffInvitation } from "$lib/server/staff";

export const load: PageServerLoad = async ({ params, locals, url }) => {
  if (!locals.account) {
    const next = encodeURIComponent(url.pathname);
    throw redirect(303, `/auth/sign-in?next=${next}`);
  }
  return { token: params.token };
};

export const actions: Actions = {
  default: async ({ params, locals }) => {
    if (!locals.account?.email) {
      return fail(401, { message: t(locals.locale ?? "en", "invite.signIn") });
    }
    try {
      await acceptStaffInvitation({
        token: params.token,
        accountId: locals.account.id,
        email: locals.account.email,
      });
    } catch (error) {
      return fail(400, {
        message:
          error instanceof Error
            ? error.message
            : t(locals.locale ?? "en", "invite.failed"),
      });
    }
    throw redirect(303, "/manager");
  },
};
