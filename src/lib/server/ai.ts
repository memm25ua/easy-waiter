import { findMenuItem, validateCart } from "$lib/cart";
import { createChatCompletion } from "./openrouter";
import { getPublishedMenu } from "./menu";
import { createServiceRoleClient } from "./supabase";
import { submitCustomerOrder } from "./table-session";
import { t } from "$lib/i18n";
import type { CartItem, Menu, SupportedLocale, TableSession } from "$lib/types";

export interface AiWaiterInput {
  session: TableSession;
  message: string;
  currentCart: CartItem[];
  locale?: SupportedLocale;
  customerConfirmedAction?: CartItem[] | null;
}

export function buildApprovedMenuContext(menu: Menu) {
  return menu.sections
    .flatMap((section) =>
      section.items
        .filter((item) => item.isAvailable)
        .map(
          (item) =>
            `${section.name}: ${item.name} ${item.description} ${(item.price / 100).toFixed(2)} ${item.currency}`,
        ),
    )
    .join("\n");
}

function proposeCart(message: string, menu: Menu, currentCart: CartItem[]) {
  const normalized = message.toLowerCase();
  const availableItems = menu.sections
    .flatMap((section) => section.items)
    .filter((item) => item.isAvailable);
  const matched =
    availableItems.find((item) =>
      normalized.includes(item.name.toLowerCase()),
    ) ??
    availableItems.find(
      (item) => normalized.includes("recommend") || normalized.includes("rice"),
    ) ??
    null;
  if (!matched) return currentCart;

  return [
    {
      menuItemId: matched.id,
      quantity: 1,
      selections: matched.options
        .map((option) => ({
          optionId: option.id,
          valueIds: option.isRequired
            ? [option.values.find((value) => value.isAvailable)?.id ?? ""]
            : [],
        }))
        .filter((selection) => selection.valueIds.every(Boolean)),
    },
  ];
}

async function writeAudit(input: {
  session: TableSession;
  actionType: string;
  proposedPayload: unknown;
  confirmationState: string;
  providerStatus: string;
  result: string;
  escalationReason?: string | null;
  submittedOrderId?: string | null;
  locale?: SupportedLocale;
}) {
  if (!input.session.restaurantId) return;
  await createServiceRoleClient()
    .from("ai_action_audits")
    .insert({
      table_session_id: input.session.id,
      restaurant_id: input.session.restaurantId,
      location_id: input.session.locationId,
      action_type: input.actionType,
      proposed_payload: input.proposedPayload,
      confirmation_state: input.confirmationState,
      provider_status: input.providerStatus,
      result: input.result,
      escalation_reason: input.escalationReason ?? null,
      submitted_order_id: input.submittedOrderId ?? null,
      locale: input.locale ?? "en",
    });
}

export async function writeMenuImportAudit(input: {
  restaurantId: string;
  locationId: string;
  importJobId: string;
  providerStatus: "not_called" | "success" | "timeout" | "error" | "disabled";
  result: string;
  fallbackReason?: string | null;
  locale?: SupportedLocale;
}) {
  await createServiceRoleClient()
    .from("ai_action_audits")
    .insert({
      restaurant_id: input.restaurantId,
      location_id: input.locationId,
      action_type: "menu_import",
      proposed_payload: { importJobId: input.importJobId },
      confirmation_state: "not_required",
      provider_status: input.providerStatus,
      result: input.result,
      escalation_reason: input.fallbackReason ?? null,
      locale: input.locale ?? "en",
    });
}

export async function runAiWaiter(input: AiWaiterInput) {
  const locale = input.locale ?? "en";
  const menu = await getPublishedMenu(input.session.locationId);
  if (!menu) throw new Error("No published menu is available for this table.");

  const normalized = input.message.toLowerCase();
  const proposal = proposeCart(input.message, menu, input.currentCart);
  const unsupported =
    normalized.includes("allergy") ||
    normalized.includes("allergen") ||
    normalized.includes("safety") ||
    normalized.includes("unsafe") ||
    normalized.includes("unavailable") ||
    normalized.includes("sold out") ||
    normalized.includes("substitution") ||
    normalized.includes("substitute") ||
    normalized.includes("refund") ||
    normalized.includes("complaint") ||
    normalized.includes("discount") ||
    normalized.includes("cancel");

  if (unsupported) {
    await writeAudit({
      session: input.session,
      actionType: "escalation",
      proposedPayload: proposal,
      confirmationState: "not_required",
      providerStatus: "not_called",
      result: "escalated",
      escalationReason: "Staff judgment required.",
      locale,
    });
    return {
      reply: t(locale, "ai.staffHelp"),
      recommendedItems: [],
      cartProposal: proposal,
      requiresConfirmation: false,
      escalationReason: t(locale, "ai.staffHelp"),
      submittedOrderId: null,
    };
  }

  if (input.customerConfirmedAction) {
    const confirmed = JSON.stringify(input.customerConfirmedAction);
    const expected = JSON.stringify(proposal);
    if (confirmed !== expected) {
      await writeAudit({
        session: input.session,
        actionType: "confirmation",
        proposedPayload: proposal,
        confirmationState: "rejected",
        providerStatus: "not_called",
        result: "confirmation_mismatch",
        locale,
      });
      throw new Error(t(locale, "ai.reviewCart"));
    }
    const validation = validateCart(menu, proposal);
    if (validation.issues.length > 0)
      throw new Error(validation.issues[0].message);
    const order = await submitCustomerOrder({
      session: input.session,
      items: proposal,
      source: "ai",
    });
    await writeAudit({
      session: input.session,
      actionType: "submit_order",
      proposedPayload: proposal,
      confirmationState: "confirmed",
      providerStatus: "not_called",
      result: "submitted",
      submittedOrderId: order.id,
      locale,
    });
    return {
      reply: t(locale, "ai.confirmed"),
      recommendedItems: proposal.map(
        (item) => findMenuItem(menu, item.menuItemId)?.name ?? "Menu item",
      ),
      cartProposal: proposal,
      requiresConfirmation: false,
      escalationReason: null,
      submittedOrderId: order.id,
    };
  }

  const provider = await createChatCompletion([
    {
      role: "system",
      content: `Answer only from this restaurant-approved menu context:\n${buildApprovedMenuContext(menu)}`,
    },
    {
      role: "user",
      content: `Reply in ${locale === "es" ? "Spanish" : "English"}.\n${input.message}`,
    },
  ]);

  const fallback = provider.providerStatus !== "success";
  const reply = fallback
    ? t(locale, "ai.unavailable")
    : provider.content ||
      (locale === "es"
        ? "Puedo ayudar con preguntas del menú y preparar un pedido para que lo confirmes."
        : "I can help with menu questions and prepare a cart for your confirmation.");

  await writeAudit({
    session: input.session,
    actionType: "proposal",
    proposedPayload: proposal,
    confirmationState: proposal.length > 0 ? "required" : "not_required",
    providerStatus: provider.providerStatus,
    result: fallback ? "fallback" : "proposed",
    escalationReason: fallback
      ? String(provider.metadata.reason ?? provider.providerStatus)
      : null,
    locale,
  });

  return {
    reply,
    recommendedItems: proposal.map(
      (item) => findMenuItem(menu, item.menuItemId)?.name ?? "Menu item",
    ),
    cartProposal: proposal,
    requiresConfirmation: proposal.length > 0,
    escalationReason: fallback ? t(locale, "ai.providerUnavailable") : null,
    submittedOrderId: null,
  };
}
