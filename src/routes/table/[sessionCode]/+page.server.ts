import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
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
  const side = String(form.get("side") ?? "");
  return [
    {
      menuItemId: itemId,
      quantity: Number(form.get("quantity") ?? 1),
      selections: side ? [{ optionId: "option-side", valueIds: [side] }] : [],
    },
  ];
}

export const load: PageServerLoad = async ({ params }) => {
  return getTableOrderingContext(params.sessionCode);
};

export const actions: Actions = {
  order: async ({ request, params }) => {
    const session = await getTableSession(params.sessionCode);
    if (!session || session.status !== "active")
      return fail(404, { message: "This table session is not active." });
    const form = await request.formData();
    try {
      const order = await submitCustomerOrder({
        session,
        items: parseCart(form),
        source: "manual",
        customerNotes: String(form.get("customerNotes") ?? ""),
      });
      return { message: "Order submitted.", orderId: order.id };
    } catch (error) {
      return fail(400, {
        message:
          error instanceof Error
            ? error.message
            : "Order could not be submitted.",
      });
    }
  },
  ai: async ({ request, params }) => {
    const session = await getTableSession(params.sessionCode);
    if (!session || session.status !== "active")
      return fail(404, { message: "This table session is not active." });
    const form = await request.formData();
    const confirm = form.get("confirm") === "true";
    const proposal = parseCart(form);
    try {
      const result = await runAiWaiter({
        session,
        message: String(form.get("message") ?? "recommend rice"),
        currentCart: [],
        customerConfirmedAction: confirm ? proposal : null,
      });
      return { ai: result, message: result.reply };
    } catch (error) {
      return fail(400, {
        message: error instanceof Error ? error.message : "AI action failed.",
      });
    }
  },
};
