import { assertOrderStatusTransition } from "$lib/order-status";
import { demoOrders } from "./demo-data";
import type { Order, OrderStatus } from "$lib/types";

const orders: Order[] = structuredClone(demoOrders);

export async function listOrders(locationId: string): Promise<Order[]> {
  return orders
    .filter((order) => order.locationId === locationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((order) => structuredClone(order));
}

export function orderNeedsAttention(order: Order): boolean {
  return (
    order.status === "needs_attention" ||
    order.customerNotes.toLowerCase().includes("allergy")
  );
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  staffNotes = "",
) {
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) throw new Error("Order not found");
  assertOrderStatusTransition(order.status, status);
  order.status = status;
  order.staffNotes = staffNotes || order.staffNotes;
  order.updatedAt = new Date().toISOString();
  return structuredClone(order);
}
