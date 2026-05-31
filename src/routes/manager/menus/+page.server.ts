import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireStaff } from "$lib/server/auth";
import {
  createMenuImportJob,
  getLatestMenuImport,
  processMenuImportJob,
  validateMenuImportFile,
} from "$lib/server/menu-import";
import { loadMenuWorkspace } from "$lib/server/menu";

export const load: PageServerLoad = async ({ locals }) => {
  const staff = await requireStaff(locals, ["owner", "manager"]);
  const workspace = await loadMenuWorkspace(staff);
  return {
    ...workspace,
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
    const validationMessage = validateMenuImportFile(file);
    if (validationMessage) return fail(400, { message: validationMessage });
    const job = await createMenuImportJob({ staff, file });
    const result = await processMenuImportJob({
      menuImportJobId: job.id,
      restaurantId: staff.restaurantId,
      locationId: staff.locationId,
      targetCurrency: staff.currency,
      locale: "en",
    });
    if (result.status === "failed" || !result.menuId) {
      return fail(503, {
        message:
          result.message ||
          "Menu import could not be completed. You can still create the menu manually.",
      });
    }
    throw redirect(303, `/manager/menus/${result.menuId}`);
  },
};
