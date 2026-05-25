import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireStaff } from "$lib/server/auth";
import { createMenuImport, getLatestMenuImport } from "$lib/server/menu-import";
import { listManagerMenus } from "$lib/server/menu";

export const load: PageServerLoad = async ({ locals }) => {
  const staff = await requireStaff(locals, ["owner", "manager"]);
  return {
    menus: await listManagerMenus(staff.locationId),
    latestImport: await getLatestMenuImport(staff.locationId),
  };
};

export const actions: Actions = {
  upload: async ({ request, locals }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    const file = form.get("menuFile");
    if (!(file instanceof File) || file.size === 0)
      return fail(400, { message: "Choose a menu file." });
    const draft = await createMenuImport(staff, file.name);
    throw redirect(303, `/manager/menus/${draft.menu.id}`);
  },
};
