import { validateCart } from "$lib/cart";
import { demoMenu } from "./demo-data";
import { submitCustomerOrder } from "./table-session";
import type { CartItem, TableSession } from "$lib/types";

export interface AiWaiterInput {
  session: TableSession;
  message: string;
  currentCart: CartItem[];
  customerConfirmedAction?: CartItem[] | null;
}

export async function runAiWaiter(input: AiWaiterInput) {
  const normalized = input.message.toLowerCase();
  const proposal: CartItem[] =
    normalized.includes("rice") || normalized.includes("recommend")
      ? [
          {
            menuItemId: "item-rice",
            quantity: 1,
            selections: [{ optionId: "option-side", valueIds: ["side-salad"] }],
          },
        ]
      : input.currentCart;

  if (
    normalized.includes("allergy") ||
    normalized.includes("refund") ||
    normalized.includes("cancel")
  ) {
    return {
      reply: "A staff member should help with that request.",
      recommendedItems: [],
      cartProposal: proposal,
      requiresConfirmation: false,
      escalationReason: "Staff judgment required.",
      submittedOrderId: null,
    };
  }

  if (input.customerConfirmedAction) {
    const confirmed = JSON.stringify(input.customerConfirmedAction);
    const expected = JSON.stringify(proposal);
    if (confirmed !== expected)
      throw new Error("Please review the updated cart before confirming.");
    const validation = validateCart(demoMenu, proposal);
    if (validation.issues.length > 0)
      throw new Error(validation.issues[0].message);
    const order = await submitCustomerOrder({
      session: input.session,
      items: proposal,
      source: "ai",
    });
    return {
      reply: "Your confirmed order has been sent to the kitchen.",
      recommendedItems: ["Chicken Rice"],
      cartProposal: proposal,
      requiresConfirmation: false,
      escalationReason: null,
      submittedOrderId: order.id,
    };
  }

  return {
    reply: normalized.includes("recommend")
      ? "The Chicken Rice is a good choice and comes with a required side."
      : "I can answer menu questions and prepare a cart for your confirmation.",
    recommendedItems: ["Chicken Rice"],
    cartProposal: proposal,
    requiresConfirmation: proposal.length > 0,
    escalationReason: null,
    submittedOrderId: null,
  };
}
