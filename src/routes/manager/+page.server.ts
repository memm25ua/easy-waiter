import type { PageServerLoad } from "./$types";
import { requireStaff } from "$lib/server/auth";
import { listManagerMenus } from "$lib/server/menu";
import { listOrders, orderNeedsAttention } from "$lib/server/orders";
import { listStableTableLinks } from "$lib/server/table-session";

export const load: PageServerLoad = async ({ locals }) => {
  const staff = await requireStaff(locals);
  const [menus, orders, tableLinks] = await Promise.all([
    listManagerMenus(staff.locationId),
    listOrders(staff.locationId),
    listStableTableLinks(staff),
  ]);
  return {
    staff,
    menu: menus[0] ?? null,
    activeOrders: orders.filter(
      (order) => !["served", "cancelled"].includes(order.status),
    ),
    needsAttention: orders.filter(orderNeedsAttention),
    tableLinks,
  };
};
