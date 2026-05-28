import type {
  AiActionAudit,
  CartItem,
  Menu,
  MenuImportDraft,
  Order,
  StaffAssignment,
  TableSession,
} from "$lib/types";
import {
  productionCart,
  productionMenu,
  productionOrder,
  productionOwner,
  productionSession,
  restaurantA,
} from "./production";
import { representativePdfMenu } from "./menu-import-files";

export const productionManager: StaffAssignment = {
  ...productionOwner,
  id: "staff-manager-a",
  accountId: "00000000-0000-0000-0000-0000000000a2",
  role: "manager",
};

export const productionStaff: StaffAssignment = {
  ...productionOwner,
  id: "staff-member-a",
  accountId: "00000000-0000-0000-0000-0000000000a3",
  role: "staff",
};

export const stableTableEntryToken = "table-entry-demo-1";

export function createCompleteWorkflowMenu(
  overrides: Partial<Menu> = {},
): Menu {
  return {
    ...productionMenu,
    ...overrides,
    sections: overrides.sections ?? productionMenu.sections,
  };
}

export function createCompleteWorkflowCart(
  overrides: Partial<CartItem> = {},
): CartItem[] {
  return [{ ...productionCart[0], ...overrides }];
}

export function createCompleteWorkflowSession(
  overrides: Partial<TableSession> = {},
): TableSession {
  return {
    ...productionSession,
    restaurantId: restaurantA.id,
    ...overrides,
  };
}

export function createCompleteWorkflowOrder(
  overrides: Partial<Order> = {},
): Order {
  return {
    ...productionOrder,
    ...overrides,
    items: overrides.items ?? productionOrder.items,
  };
}

export function createCompleteWorkflowImportDraft(
  overrides: Partial<MenuImportDraft> = {},
): MenuImportDraft {
  return {
    id: "import-draft-demo-1",
    locationId: productionOwner.locationId,
    status: "needs_review",
    sourceFilePath: `menu-imports/${restaurantA.id}/${representativePdfMenu.fileName}`,
    confidenceSummary: [
      "Critical: confirm Chicken Rice price before publishing.",
      "Non-critical: review category grouping.",
    ],
    errorMessage: null,
    menu: createCompleteWorkflowMenu({ status: "draft", publishedAt: null }),
    ...overrides,
  };
}

export function createCompleteWorkflowAiAudit(
  overrides: Partial<AiActionAudit> = {},
): AiActionAudit {
  return {
    id: "ai-audit-import-1",
    conversationId: null,
    tableSessionId: productionSession.id,
    restaurantId: restaurantA.id,
    locationId: productionOwner.locationId,
    actionType: "menu_import",
    proposedPayload: { importDraftId: "import-draft-demo-1" },
    confirmationState: "not_required",
    providerStatus: "success",
    result: "draft_created",
    escalationReason: null,
    submittedOrderId: null,
    locale: "en",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
