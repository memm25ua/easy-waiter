import type { PageServerLoad } from "./$types";
import { getOperationalSummary } from "$lib/server/analytics";
import { requireStaff } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals, url }) => {
  const staff = await requireStaff(locals, ["owner", "manager"]);
  const period = url.searchParams.get("period") ?? "today";
  return {
    period,
    summary: await getOperationalSummary(staff.locationId),
  };
};
