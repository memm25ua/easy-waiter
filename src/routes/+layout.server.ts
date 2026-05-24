import type { LayoutServerLoad } from "./$types";
import { getStaffAssignment } from "$lib/server/auth";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    staff: locals.staff ?? (await getStaffAssignment(locals)),
  };
};
