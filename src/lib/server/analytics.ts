import type { OperationalSummary, Order } from "$lib/types";

export function aggregateOperationalSummary(
  orders: Order[],
  openedAtBySession = new Map<string, string>(),
): OperationalSummary {
  const aiAssistedOrders = orders.filter(
    (order) => order.source === "ai",
  ).length;
  const manualOrders = orders.filter(
    (order) => order.source === "manual",
  ).length;
  const staffInterventions = orders.filter(
    (order) => order.status === "needs_attention" || order.staffNotes,
  ).length;
  const submissionDurations = orders
    .map((order) => {
      const openedAt = openedAtBySession.get(order.tableSessionId);
      return openedAt
        ? (new Date(order.createdAt).getTime() - new Date(openedAt).getTime()) /
            1000
        : null;
    })
    .filter((value): value is number => value !== null && value >= 0);

  return {
    totalOrders: orders.length,
    aiAssistedOrders,
    manualOrders,
    staffInterventions,
    averageSubmissionSeconds:
      submissionDurations.length === 0
        ? 0
        : Math.round(
            submissionDurations.reduce((sum, value) => sum + value, 0) /
              submissionDurations.length,
          ),
  };
}
