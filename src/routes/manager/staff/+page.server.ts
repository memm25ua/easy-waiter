import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createStaffInvitation, listStaffInvitations } from "$lib/server/staff";
import { requireStaff } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  const staff = await requireStaff(locals, ["owner", "manager"]);
  return { invitations: await listStaffInvitations(staff) };
};

export const actions: Actions = {
  invite: async ({ request, locals }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    const email = String(form.get("email") ?? "");
    const role = String(form.get("role") ?? "staff");
    const locationId = String(form.get("locationId") || staff.locationId);
    if (role !== "manager" && role !== "staff") {
      return fail(400, { message: "Choose a valid staff role.", email });
    }
    try {
      const { token } = await createStaffInvitation({
        actor: staff,
        email,
        role,
        locationId,
      });
      return {
        message: "Invitation created.",
        invitePath: `/auth/invite/${token}`,
      };
    } catch (error) {
      return fail(400, {
        message:
          error instanceof Error
            ? error.message
            : "The invitation could not be created.",
        email,
      });
    }
  },
};
