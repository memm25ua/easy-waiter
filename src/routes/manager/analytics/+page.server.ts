import type { PageServerLoad } from "./$types";
import { aggregateOperationalSummary } from "$lib/server/analytics";
import { requireStaff } from "$lib/server/auth";
import { demoSession } from "$lib/server/demo-data";
import { listOrders } from "$lib/server/orders";

export const load: PageServerLoad = async ({ locals, url }) => {
  const staff = await requireStaff(locals, ["owner", "manager"]);
  const period = url.searchParams.get("period") ?? "today";
  const orders = await listOrders(staff.locationId);
  return {
    period,
    summary: aggregateOperationalSummary(
      orders,
      new Map([[demoSession.id, demoSession.openedAt]]),
    ),
  };
};
