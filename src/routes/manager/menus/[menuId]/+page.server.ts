import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { validateMenuForPublish } from "$lib/menu-publish";
import { requireStaff } from "$lib/server/auth";
import {
  getManagerMenu,
  publishMenu,
  saveMenu,
  setItemAvailability,
} from "$lib/server/menu";

export const load: PageServerLoad = async ({ locals, params }) => {
  await requireStaff(locals, ["owner", "manager"]);
  return { menu: await getManagerMenu(params.menuId) };
};

export const actions: Actions = {
  save: async ({ request, locals, params }) => {
    await requireStaff(locals, ["owner", "manager"]);
    const menu = await getManagerMenu(params.menuId);
    if (!menu) return fail(404, { message: "Menu not found." });
    const form = await request.formData();
    menu.title = String(form.get("title") ?? menu.title);
    for (const section of menu.sections) {
      for (const item of section.items) {
        item.name = String(form.get(`name:${item.id}`) ?? item.name);
        item.description = String(
          form.get(`description:${item.id}`) ?? item.description,
        );
        item.price = Math.round(
          Number(form.get(`price:${item.id}`) ?? item.price / 100) * 100,
        );
        item.confidenceFlags = [];
      }
    }
    await saveMenu(menu);
    return { message: "Menu saved." };
  },
  publish: async ({ locals, params }) => {
    await requireStaff(locals, ["owner", "manager"]);
    const menu = await getManagerMenu(params.menuId);
    if (!menu) return fail(404, { message: "Menu not found." });
    const result = validateMenuForPublish(menu);
    if (!result.canPublish)
      return fail(400, { message: result.issues[0], issues: result.issues });
    await publishMenu(params.menuId);
    return { message: "Menu published." };
  },
  availability: async ({ request, locals, params }) => {
    await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await setItemAvailability(
      params.menuId,
      String(form.get("itemId")),
      form.get("isAvailable") === "true",
    );
    return { message: "Availability updated." };
  },
};
