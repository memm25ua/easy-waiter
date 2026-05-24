import type { LayoutServerLoad } from "./$types";
import { requireStaff } from "$lib/server/auth";

export const load: LayoutServerLoad = async ({ locals }) => {
  return { staff: await requireStaff(locals) };
};
