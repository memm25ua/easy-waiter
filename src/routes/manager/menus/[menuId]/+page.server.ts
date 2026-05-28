import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireStaff } from "$lib/server/auth";
import {
  listImportWarnings,
  resolveImportWarning,
} from "$lib/server/menu-import";
import {
  addMenuItem,
  addMenuSection,
  addItemOption,
  addItemOptionValue,
  archiveItemOption,
  archiveItemOptionValue,
  archiveMenuItem,
  duplicateMenuItem,
  getManagerMenu,
  publishMenu,
  reorderMenuItem,
  reorderItemOption,
  reorderItemOptionValue,
  saveMenuDraft,
  setItemAvailability,
} from "$lib/server/menu";
import { assertCanManageMenus } from "$lib/server/tenant";

export const load: PageServerLoad = async ({ locals, params }) => {
  const staff = await requireStaff(locals, ["owner", "manager"]);
  const menu = await getManagerMenu(params.menuId);
  if (menu) assertCanManageMenus(staff, menu.locationId);
  return {
    menu,
    importWarnings: await listImportWarnings(params.menuId),
  };
};

export const actions: Actions = {
  save: async ({ request, locals, params }) => {
    await requireStaff(locals, ["owner", "manager"]);
    const menu = await getManagerMenu(params.menuId);
    if (!menu) return fail(404, { message: "Menu not found." });
    const form = await request.formData();
    const staff = await requireStaff(locals, ["owner", "manager"]);
    assertCanManageMenus(staff, menu.locationId);
    menu.title = String(form.get("title") ?? menu.title);
    const lastSeenVersion = Number(
      form.get("lastSeenVersion") ?? menu.currentVersion ?? 1,
    );
    for (const section of menu.sections) {
      section.name = String(
        form.get(`sectionName:${section.id}`) ?? section.name,
      );
      section.description = String(
        form.get(`sectionDescription:${section.id}`) ?? section.description,
      );
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
    const result = await saveMenuDraft({
      menu,
      staff,
      lastSeenVersion,
      changeSummary: "Menu review saved.",
    });
    if (result.conflict) {
      return fail(409, {
        message: "This menu changed in another session. Review before saving.",
        issues: ["This menu changed in another session. Review before saving."],
        currentVersion: result.currentVersion,
      });
    }
    return { message: "Menu saved." };
  },
  publish: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const menu = await getManagerMenu(params.menuId);
    if (!menu) return fail(404, { message: "Menu not found." });
    assertCanManageMenus(staff, menu.locationId);
    const form = await request.formData();
    const lastSeenVersion = Number(
      form.get("lastSeenVersion") ?? menu.currentVersion ?? 1,
    );
    const result = await publishMenu(params.menuId, {
      staff,
      lastSeenVersion,
    });
    if (result.blocked)
      return fail(400, { message: result.issues[0], issues: result.issues });
    return { message: "Menu published." };
  },
  addSection: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await addMenuSection({
      menuId: params.menuId,
      staff,
      name: String(form.get("sectionName") ?? ""),
      description: String(form.get("sectionDescription") ?? ""),
    });
    return { message: "Section added." };
  },
  addItem: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await addMenuItem({
      menuId: params.menuId,
      sectionId: String(form.get("sectionId") ?? ""),
      staff,
      name: String(form.get("itemName") ?? ""),
      price: Math.round(Number(form.get("itemPrice") ?? 0) * 100),
      currency: staff.currency,
    });
    return { message: "Item added." };
  },
  duplicateItem: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await duplicateMenuItem({
      menuId: params.menuId,
      itemId: String(form.get("itemId") ?? ""),
      staff,
    });
    return { message: "Item duplicated." };
  },
  reorderItem: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await reorderMenuItem({
      menuId: params.menuId,
      itemId: String(form.get("itemId") ?? ""),
      staff,
      direction: form.get("direction") === "up" ? "up" : "down",
    });
    return { message: "Item moved." };
  },
  archiveItem: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await archiveMenuItem({
      menuId: params.menuId,
      itemId: String(form.get("itemId") ?? ""),
      staff,
    });
    return { message: "Item archived." };
  },
  addOptionGroup: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await addItemOption({
      menuId: params.menuId,
      itemId: String(form.get("itemId") ?? ""),
      staff,
      name: String(form.get("optionName") ?? ""),
      isRequired: form.get("isRequired") === "true",
    });
    return { message: "Option added." };
  },
  addOptionValue: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await addItemOptionValue({
      menuId: params.menuId,
      optionId: String(form.get("optionId") ?? ""),
      staff,
      name: String(form.get("valueName") ?? ""),
      priceDelta: Math.round(Number(form.get("priceDelta") ?? 0) * 100),
    });
    return { message: "Choice added." };
  },
  archiveOptionGroup: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await archiveItemOption({
      menuId: params.menuId,
      optionId: String(form.get("optionId") ?? ""),
      staff,
    });
    return { message: "Option archived." };
  },
  reorderOptionGroup: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await reorderItemOption({
      menuId: params.menuId,
      optionId: String(form.get("optionId") ?? ""),
      staff,
      direction: form.get("direction") === "up" ? "up" : "down",
    });
    return { message: "Option moved." };
  },
  archiveOptionValue: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await archiveItemOptionValue({
      menuId: params.menuId,
      valueId: String(form.get("valueId") ?? ""),
      staff,
    });
    return { message: "Choice archived." };
  },
  reorderOptionValue: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const form = await request.formData();
    await reorderItemOptionValue({
      menuId: params.menuId,
      valueId: String(form.get("valueId") ?? ""),
      staff,
      direction: form.get("direction") === "up" ? "up" : "down",
    });
    return { message: "Choice moved." };
  },
  availability: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const menu = await getManagerMenu(params.menuId);
    if (!menu) return fail(404, { message: "Menu not found." });
    assertCanManageMenus(staff, menu.locationId);
    const form = await request.formData();
    await setItemAvailability(
      params.menuId,
      String(form.get("itemId")),
      form.get("isAvailable") === "true",
    );
    return { message: "Availability updated." };
  },
  resolveWarning: async ({ request, locals, params }) => {
    const staff = await requireStaff(locals, ["owner", "manager"]);
    const menu = await getManagerMenu(params.menuId);
    if (!menu) return fail(404, { message: "Menu not found." });
    assertCanManageMenus(staff, menu.locationId);
    const form = await request.formData();
    const warningId = String(form.get("warningId") ?? "");
    const action = form.get("action") === "accepted" ? "accepted" : "resolved";
    if (!warningId) return fail(400, { message: "Warning not found." });
    await resolveImportWarning({ warningId, staffId: staff.id, action });
    return { message: "Warning updated." };
  },
};
