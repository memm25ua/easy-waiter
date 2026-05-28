import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireStaff } from "$lib/server/auth";
import {
  listAssignedLocationOrders,
  updateOrderStatus,
} from "$lib/server/orders";
import { assertCanHandleOrders } from "$lib/server/tenant";
import type { OrderStatus } from "$lib/types";

export const load: PageServerLoad = async ({ locals }) => {
  const staff = await requireStaff(locals);
  assertCanHandleOrders(staff, staff.locationId);
  return {
    orders: await listAssignedLocationOrders(staff),
    locationId: staff.locationId,
  };
};

export const actions: Actions = {
  status: async ({ request, locals }) => {
    const staff = await requireStaff(locals);
    assertCanHandleOrders(staff, staff.locationId);
    const form = await request.formData();
    try {
      await updateOrderStatus(
        String(form.get("orderId")),
        String(form.get("status")) as OrderStatus,
        String(form.get("staffNotes") ?? ""),
        staff.id,
      );
      return { message: "Order updated." };
    } catch (error) {
      return fail(400, {
        message:
          error instanceof Error
            ? error.message
            : "Order could not be updated.",
      });
    }
  },
};
