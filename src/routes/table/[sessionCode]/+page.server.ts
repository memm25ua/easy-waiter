import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { t } from "$lib/i18n";
import { runAiWaiter } from "$lib/server/ai";
import {
  getTableOrderingContext,
  getTableSession,
  submitCustomerOrder,
} from "$lib/server/table-session";
import type { CartItem } from "$lib/types";

function parseCart(form: FormData): CartItem[] {
  const itemId = String(form.get("itemId") ?? "");
  if (!itemId) return [];
  const optionId = String(form.get("optionId") ?? "");
  const optionValueId = String(form.get("optionValueId") ?? "");
  return [
    {
      menuItemId: itemId,
      quantity: Number(form.get("quantity") ?? 1),
      selections:
        optionId && optionValueId
          ? [{ optionId, valueIds: [optionValueId] }]
          : [],
    },
  ];
}

export const load: PageServerLoad = async ({ params, parent }) => {
  const layout = await parent();
  const base = await getTableOrderingContext(params.sessionCode);
  return { ...base, dictionary: layout.dictionary, locale: layout.locale };
};

export const actions: Actions = {
  order: async ({ request, params, locals }) => {
    const locale = locals.locale ?? "en";
    const session = await getTableSession(params.sessionCode);
    if (!session || session.status !== "active")
      return fail(404, { message: t(locale, "table.inactive.title") });
    const form = await request.formData();
    try {
      const order = await submitCustomerOrder({
        session,
        items: parseCart(form),
        source: "manual",
        customerNotes: String(form.get("customerNotes") ?? ""),
      });
      return { message: t(locale, "table.submitted"), orderId: order.id };
    } catch (error) {
      return fail(400, {
        message:
          error instanceof Error
            ? error.message
            : t(locale, "table.submitFailed"),
      });
    }
  },
  ai: async ({ request, params, locals }) => {
    const locale = locals.locale ?? "en";
    const session = await getTableSession(params.sessionCode);
    if (!session || session.status !== "active")
      return fail(404, { message: t(locale, "table.inactive.title") });
    const form = await request.formData();
    const confirm = form.get("confirm") === "true";
    const proposal = parseCart(form);
    try {
      const result = await runAiWaiter({
        session,
        message: String(form.get("message") ?? "recommend rice"),
        currentCart: [],
        locale,
        customerConfirmedAction: confirm ? proposal : null,
      });
      return { ai: result, message: result.reply };
    } catch (error) {
      return fail(400, {
        message:
          error instanceof Error ? error.message : t(locale, "ai.failed"),
      });
    }
  },
};
