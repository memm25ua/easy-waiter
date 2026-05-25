import type { LayoutServerLoad } from "./$types";
import { getDictionary } from "$lib/i18n";
import { getStaffAssignment } from "$lib/server/auth";

export const load: LayoutServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? "en";
  return {
    staff: locals.staff ?? (await getStaffAssignment(locals)),
    locale,
    dictionary: getDictionary(locale),
  };
};
