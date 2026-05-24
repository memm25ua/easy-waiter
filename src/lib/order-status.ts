import type { OrderStatus } from "./types";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  new: ["accepted", "preparing", "cancelled", "needs_attention"],
  accepted: ["preparing", "cancelled", "needs_attention"],
  preparing: ["ready", "needs_attention"],
  ready: ["served", "needs_attention"],
  served: [],
  cancelled: [],
  needs_attention: ["accepted", "preparing", "cancelled"],
};

export function getAllowedOrderStatuses(status: OrderStatus): OrderStatus[] {
  return transitions[status] ?? [];
}

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return getAllowedOrderStatuses(from).includes(to);
}

export function assertOrderStatusTransition(
  from: OrderStatus,
  to: OrderStatus,
) {
  if (!canTransitionOrderStatus(from, to)) {
    throw new Error(`Order cannot move from ${from} to ${to}`);
  }
}
