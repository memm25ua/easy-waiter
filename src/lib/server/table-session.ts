import { validateCart } from "$lib/cart";
import { demoMenu, demoSession } from "./demo-data";
import type { CartItem, Order, TableSession } from "$lib/types";

const submittedOrders: Order[] = [];

export async function getTableSession(
  sessionCode: string,
): Promise<TableSession | null> {
  if (sessionCode === demoSession.sessionCode)
    return structuredClone(demoSession);
  if (sessionCode === "EXPIRED")
    return { ...structuredClone(demoSession), status: "expired", sessionCode };
  return null;
}

export async function getTableOrderingContext(sessionCode: string) {
  const session = await getTableSession(sessionCode);
  if (!session || session.status !== "active")
    return { session, menu: null, orders: [] };
  return {
    session,
    menu: structuredClone(demoMenu),
    orders: submittedOrders.filter(
      (order) => order.tableSessionId === session.id,
    ),
  };
}

export async function submitCustomerOrder(input: {
  session: TableSession;
  items: CartItem[];
  source: "manual" | "ai";
  customerNotes?: string;
}): Promise<Order> {
  const validation = validateCart(demoMenu, input.items);
  if (validation.issues.length > 0)
    throw new Error(validation.issues[0].message);

  const order: Order = {
    id: `order-${Date.now()}`,
    locationId: input.session.locationId,
    tableSessionId: input.session.id,
    tableLabel: input.session.tableLabel,
    source: input.source,
    status: "new",
    items: structuredClone(input.items),
    total: validation.total,
    currency: validation.currency,
    customerNotes: input.customerNotes ?? "",
    staffNotes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  submittedOrders.unshift(order);
  return structuredClone(order);
}
