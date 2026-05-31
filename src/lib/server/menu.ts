import { createServiceRoleClient } from "./supabase";
import type { AiMenuDraftResponse } from "./openrouter";
import {
  buildPublishedMenuSnapshotPayload,
  validateDraftVersionForSave,
  validateImportWarningsForPublish,
  validateMenuForPublish,
} from "$lib/menu-publish";
import { assertCanManageMenus, canManageMenus } from "./tenant";
import { listImportWarnings } from "./menu-import";
import type {
  Menu,
  MenuItem,
  MenuItemOption,
  MenuSection,
  PublishedMenuSnapshot,
  StaffAssignment,
} from "$lib/types";

interface MenuRow {
  id: string;
  restaurant_id?: string | null;
  location_id: string;
  title: string;
  status: Menu["status"];
  published_at: string | null;
  current_version?: number | null;
  menu_sections: Array<{
    id: string;
    name: string;
    description: string;
    sort_order: number;
    menu_items: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      dietary_tags: string[];
      allergen_notes: string;
      is_available: boolean;
      sort_order: number;
      confidence_flags: string[];
      suggestions: string[];
      menu_item_options: Array<{
        id: string;
        name: string;
        is_required: boolean;
        min_choices: number;
        max_choices: number;
        sort_order: number;
        menu_item_option_values: Array<{
          id: string;
          name: string;
          price_delta: number;
          is_available: boolean;
          sort_order: number;
        }>;
      }>;
    }>;
  }>;
}

const menuSelect = `
  id,restaurant_id,location_id,title,status,published_at,current_version,
  menu_sections(
    id,name,description,sort_order,
    menu_items(
      id,name,description,price,currency,dietary_tags,allergen_notes,is_available,sort_order,confidence_flags,suggestions,
      menu_item_options(
        id,name,is_required,min_choices,max_choices,sort_order,
        menu_item_option_values(id,name,price_delta,is_available,sort_order)
      )
    )
  )
`;

function mapMenu(row: MenuRow): Menu {
  return {
    id: row.id,
    restaurantId: row.restaurant_id ?? null,
    locationId: row.location_id,
    title: row.title,
    status: row.status,
    publishedAt: row.published_at,
    currentVersion: row.current_version ?? 1,
    sections: [...(row.menu_sections ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map<MenuSection>((section) => ({
        id: section.id,
        name: section.name,
        description: section.description,
        sortOrder: section.sort_order,
        items: [...(section.menu_items ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map<MenuItem>((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            dietaryTags: item.dietary_tags ?? [],
            allergenNotes: item.allergen_notes,
            isAvailable: item.is_available,
            sortOrder: item.sort_order,
            confidenceFlags: item.confidence_flags ?? [],
            suggestions: item.suggestions ?? [],
            options: [...(item.menu_item_options ?? [])]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map<MenuItemOption>((option) => ({
                id: option.id,
                name: option.name,
                isRequired: option.is_required,
                minChoices: option.min_choices,
                maxChoices: option.max_choices,
                values: [...(option.menu_item_option_values ?? [])]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((value) => ({
                    id: value.id,
                    name: value.name,
                    priceDelta: value.price_delta,
                    isAvailable: value.is_available,
                  })),
              })),
          })),
      })),
  };
}

export async function getPublishedMenu(
  locationId: string,
): Promise<Menu | null> {
  const { data, error } = await createServiceRoleClient()
    .from("menus")
    .select(menuSelect)
    .eq("location_id", locationId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapMenu(data as unknown as MenuRow) : null;
}

export async function getManagerMenu(menuId: string): Promise<Menu | null> {
  const { data, error } = await createServiceRoleClient()
    .from("menus")
    .select(menuSelect)
    .eq("id", menuId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapMenu(data as unknown as MenuRow) : null;
}

export async function listManagerMenus(locationId: string) {
  const { data, error } = await createServiceRoleClient()
    .from("menus")
    .select(menuSelect)
    .eq("location_id", locationId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapMenu(row as unknown as MenuRow));
}

export async function loadMenuWorkspace(staff: StaffAssignment) {
  const menus = await listManagerMenus(staff.locationId);
  const currentPublishedMenu =
    menus.find((menu) => menu.status === "published") ??
    (await getPublishedMenu(staff.locationId));
  const { data: importRows, error } = await createServiceRoleClient()
    .from("menu_imports")
    .select("id,status,source_file_name,source_file_path,created_at")
    .eq("location_id", staff.locationId)
    .in("status", [
      "uploaded",
      "ocr_processing",
      "ai_processing",
      "review_ready",
      "processing",
      "needs_review",
      "failed",
    ])
    .order("created_at", { ascending: false });
  if (error) throw error;

  return {
    drafts: menus.filter((menu) => menu.status !== "published"),
    menus,
    currentPublishedMenu,
    openImportJobs: importRows ?? [],
    permissions: {
      canEdit: canManageMenus(staff, staff.locationId),
      canPublish: canManageMenus(staff, staff.locationId),
    },
    locale: "en" as const,
  };
}

export async function saveMenu(menu: Menu) {
  const client = createServiceRoleClient();
  const { error } = await client
    .from("menus")
    .update({ title: menu.title })
    .eq("id", menu.id);
  if (error) throw error;

  for (const section of menu.sections) {
    for (const item of section.items) {
      const { error: itemError } = await client
        .from("menu_items")
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          confidence_flags: item.confidenceFlags ?? [],
          suggestions: item.suggestions ?? [],
          is_available: item.isAvailable,
        })
        .eq("id", item.id);
      if (itemError) throw itemError;

      for (const option of item.options) {
        const { error: optionError } = await client
          .from("menu_item_options")
          .update({
            name: option.name,
            is_required: option.isRequired,
            min_choices: option.minChoices,
            max_choices: option.maxChoices,
          })
          .eq("id", option.id)
          .eq("menu_item_id", item.id);
        if (optionError) throw optionError;

        for (const value of option.values) {
          const { error: valueError } = await client
            .from("menu_item_option_values")
            .update({
              name: value.name,
              price_delta: value.priceDelta,
              is_available: value.isAvailable,
            })
            .eq("id", value.id)
            .eq("option_id", option.id);
          if (valueError) throw valueError;
        }
      }
    }
  }
  const saved = await getManagerMenu(menu.id);
  if (!saved) throw new Error("Menu not found after save.");
  return saved;
}

export async function addMenuSection(input: {
  menuId: string;
  staff: StaffAssignment;
  name: string;
  description?: string;
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const nextOrder =
    Math.max(-1, ...menu.sections.map((section) => section.sortOrder)) + 1;
  const { error } = await createServiceRoleClient()
    .from("menu_sections")
    .insert({
      menu_id: input.menuId,
      name: input.name.trim() || "New section",
      description: input.description?.trim() ?? "",
      sort_order: nextOrder,
    });
  if (error) throw error;
  return getManagerMenu(input.menuId);
}

export async function addMenuItem(input: {
  menuId: string;
  sectionId: string;
  staff: StaffAssignment;
  name: string;
  price: number;
  currency: string;
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const section = menu.sections.find(
    (candidate) => candidate.id === input.sectionId,
  );
  if (!section) throw new Error("Menu section not found");
  const nextOrder =
    Math.max(-1, ...section.items.map((item) => item.sortOrder)) + 1;
  const { error } = await createServiceRoleClient()
    .from("menu_items")
    .insert({
      section_id: input.sectionId,
      name: input.name.trim() || "New item",
      description: "",
      price: input.price,
      currency: input.currency,
      sort_order: nextOrder,
    });
  if (error) throw error;
  return getManagerMenu(input.menuId);
}

export async function duplicateMenuItem(input: {
  menuId: string;
  itemId: string;
  staff: StaffAssignment;
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const section = menu.sections.find((candidate) =>
    candidate.items.some((item) => item.id === input.itemId),
  );
  const item = section?.items.find(
    (candidate) => candidate.id === input.itemId,
  );
  if (!section || !item) throw new Error("Menu item not found");

  const client = createServiceRoleClient();
  const { data: itemRow, error: itemError } = await client
    .from("menu_items")
    .insert({
      section_id: section.id,
      name: `${item.name} copy`,
      description: item.description,
      price: item.price,
      currency: item.currency,
      dietary_tags: item.dietaryTags ?? [],
      allergen_notes: item.allergenNotes,
      is_available: item.isAvailable,
      sort_order: item.sortOrder + 1,
      confidence_flags: item.confidenceFlags ?? [],
      suggestions: item.suggestions ?? [],
    })
    .select("id")
    .single();
  if (itemError) throw itemError;

  for (const option of item.options) {
    const { data: optionRow, error: optionError } = await client
      .from("menu_item_options")
      .insert({
        menu_item_id: itemRow.id,
        name: option.name,
        is_required: option.isRequired,
        min_choices: option.minChoices,
        max_choices: option.maxChoices,
      })
      .select("id")
      .single();
    if (optionError) throw optionError;
    for (const value of option.values) {
      const { error: valueError } = await client
        .from("menu_item_option_values")
        .insert({
          option_id: optionRow.id,
          name: value.name,
          price_delta: value.priceDelta,
          is_available: value.isAvailable,
        });
      if (valueError) throw valueError;
    }
  }

  return getManagerMenu(input.menuId);
}

export async function reorderMenuItem(input: {
  menuId: string;
  itemId: string;
  staff: StaffAssignment;
  direction: "up" | "down";
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const section = menu.sections.find((candidate) =>
    candidate.items.some((item) => item.id === input.itemId),
  );
  if (!section) throw new Error("Menu item not found");
  const ordered = [...section.items].sort((a, b) => a.sortOrder - b.sortOrder);
  const index = ordered.findIndex((item) => item.id === input.itemId);
  const swapIndex = input.direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) return menu;

  const current = ordered[index];
  const swap = ordered[swapIndex];
  const client = createServiceRoleClient();
  const { error: currentError } = await client
    .from("menu_items")
    .update({ sort_order: swap.sortOrder })
    .eq("id", current.id);
  if (currentError) throw currentError;
  const { error: swapError } = await client
    .from("menu_items")
    .update({ sort_order: current.sortOrder })
    .eq("id", swap.id);
  if (swapError) throw swapError;
  return getManagerMenu(input.menuId);
}

export async function archiveMenuItem(input: {
  menuId: string;
  itemId: string;
  staff: StaffAssignment;
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const { error } = await createServiceRoleClient()
    .from("menu_items")
    .update({ is_available: false })
    .eq("id", input.itemId);
  if (error) throw error;
  return getManagerMenu(input.menuId);
}

export async function addItemOption(input: {
  menuId: string;
  itemId: string;
  staff: StaffAssignment;
  name: string;
  isRequired: boolean;
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const item = menu.sections
    .flatMap((section) => section.items)
    .find((candidate) => candidate.id === input.itemId);
  if (!item) throw new Error("Menu item not found");
  const nextOrder = item.options.length;
  const { error } = await createServiceRoleClient()
    .from("menu_item_options")
    .insert({
      menu_item_id: input.itemId,
      name: input.name.trim() || "New option",
      is_required: input.isRequired,
      min_choices: input.isRequired ? 1 : 0,
      max_choices: 1,
      sort_order: nextOrder,
    });
  if (error) throw error;
  return getManagerMenu(input.menuId);
}

export async function addItemOptionValue(input: {
  menuId: string;
  optionId: string;
  staff: StaffAssignment;
  name: string;
  priceDelta: number;
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const option = menu.sections
    .flatMap((section) => section.items)
    .flatMap((item) => item.options)
    .find((candidate) => candidate.id === input.optionId);
  if (!option) throw new Error("Menu option not found");
  const nextOrder = option.values.length;
  const { error } = await createServiceRoleClient()
    .from("menu_item_option_values")
    .insert({
      option_id: input.optionId,
      name: input.name.trim() || "New choice",
      price_delta: input.priceDelta,
      sort_order: nextOrder,
    });
  if (error) throw error;
  return getManagerMenu(input.menuId);
}

export async function archiveItemOption(input: {
  menuId: string;
  optionId: string;
  staff: StaffAssignment;
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const client = createServiceRoleClient();
  const { error: optionError } = await client
    .from("menu_item_options")
    .update({ is_required: false, min_choices: 0 })
    .eq("id", input.optionId);
  if (optionError) throw optionError;
  const { error: valueError } = await client
    .from("menu_item_option_values")
    .update({ is_available: false })
    .eq("option_id", input.optionId);
  if (valueError) throw valueError;
  return getManagerMenu(input.menuId);
}

export async function reorderItemOption(input: {
  menuId: string;
  optionId: string;
  staff: StaffAssignment;
  direction: "up" | "down";
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const item = menu.sections
    .flatMap((section) => section.items)
    .find((candidate) =>
      candidate.options.some((option) => option.id === input.optionId),
    );
  if (!item) throw new Error("Menu option not found");
  const index = item.options.findIndex(
    (option) => option.id === input.optionId,
  );
  const swapIndex = input.direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= item.options.length)
    return menu;
  const client = createServiceRoleClient();
  const { error: currentError } = await client
    .from("menu_item_options")
    .update({ sort_order: swapIndex })
    .eq("id", item.options[index].id);
  if (currentError) throw currentError;
  const { error: swapError } = await client
    .from("menu_item_options")
    .update({ sort_order: index })
    .eq("id", item.options[swapIndex].id);
  if (swapError) throw swapError;
  return getManagerMenu(input.menuId);
}

export async function archiveItemOptionValue(input: {
  menuId: string;
  valueId: string;
  staff: StaffAssignment;
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const { error } = await createServiceRoleClient()
    .from("menu_item_option_values")
    .update({ is_available: false })
    .eq("id", input.valueId);
  if (error) throw error;
  return getManagerMenu(input.menuId);
}

export async function reorderItemOptionValue(input: {
  menuId: string;
  valueId: string;
  staff: StaffAssignment;
  direction: "up" | "down";
}) {
  const menu = await getManagerMenu(input.menuId);
  if (!menu) throw new Error("Menu not found");
  assertCanManageMenus(input.staff, menu.locationId);
  const option = menu.sections
    .flatMap((section) => section.items)
    .flatMap((item) => item.options)
    .find((candidate) =>
      candidate.values.some((value) => value.id === input.valueId),
    );
  if (!option) throw new Error("Menu option value not found");
  const index = option.values.findIndex((value) => value.id === input.valueId);
  const swapIndex = input.direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= option.values.length)
    return menu;
  const client = createServiceRoleClient();
  const { error: currentError } = await client
    .from("menu_item_option_values")
    .update({ sort_order: swapIndex })
    .eq("id", option.values[index].id);
  if (currentError) throw currentError;
  const { error: swapError } = await client
    .from("menu_item_option_values")
    .update({ sort_order: index })
    .eq("id", option.values[swapIndex].id);
  if (swapError) throw swapError;
  return getManagerMenu(input.menuId);
}

export async function saveMenuDraft(input: {
  menu: Menu;
  staff: StaffAssignment;
  lastSeenVersion: number;
  changeSummary?: string;
}) {
  assertCanManageMenus(input.staff, input.menu.locationId);
  const current = await getManagerMenu(input.menu.id);
  if (!current) throw new Error("Menu not found");

  const versionCheck = validateDraftVersionForSave(
    input.lastSeenVersion,
    current.currentVersion ?? 1,
  );
  if (!versionCheck.ok) {
    return {
      conflict: true as const,
      currentMenu: current,
      ...versionCheck.conflict,
    };
  }

  const client = createServiceRoleClient();
  const { error: menuError } = await client
    .from("menus")
    .update({
      title: input.menu.title,
      current_version: versionCheck.nextVersion,
    })
    .eq("id", input.menu.id);
  if (menuError) throw menuError;

  for (const section of input.menu.sections) {
    const { error: sectionError } = await client
      .from("menu_sections")
      .update({
        name: section.name,
        description: section.description,
        sort_order: section.sortOrder,
      })
      .eq("id", section.id)
      .eq("menu_id", input.menu.id);
    if (sectionError) throw sectionError;

    for (const item of section.items) {
      const { error: itemError } = await client
        .from("menu_items")
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          currency: item.currency,
          dietary_tags: item.dietaryTags ?? [],
          allergen_notes: item.allergenNotes,
          confidence_flags: item.confidenceFlags ?? [],
          suggestions: item.suggestions ?? [],
          is_available: item.isAvailable,
          sort_order: item.sortOrder,
        })
        .eq("id", item.id);
      if (itemError) throw itemError;
    }
  }

  const { error: versionError } = await client
    .from("menu_draft_versions")
    .insert({
      menu_id: input.menu.id,
      version_number: versionCheck.nextVersion,
      change_summary: input.changeSummary ?? "Menu draft saved.",
      changed_by: input.staff.id,
    });
  if (versionError) throw versionError;

  const saved = await getManagerMenu(input.menu.id);
  if (!saved) throw new Error("Menu not found after save.");
  return {
    conflict: false as const,
    menu: saved,
    newVersion: versionCheck.nextVersion,
  };
}

async function writePublishedSnapshot(input: {
  menu: Menu;
  staff?: StaffAssignment;
}) {
  const client = createServiceRoleClient();
  const snapshotPayload = buildPublishedMenuSnapshotPayload(input.menu);
  const { data, error } = await client
    .from("published_menu_snapshots")
    .insert({
      restaurant_id: input.staff?.restaurantId ?? input.menu.restaurantId,
      location_id: input.menu.locationId,
      menu_id: input.menu.id,
      menu_version: input.menu.currentVersion ?? 1,
      published_by: input.staff?.id,
      is_current: true,
      snapshot_payload: snapshotPayload,
    })
    .select(
      "id,restaurant_id,location_id,menu_id,menu_version,published_by,published_at,is_current,snapshot_payload",
    )
    .single();
  if (error) throw error;
  return {
    id: data.id,
    restaurantId: data.restaurant_id,
    locationId: data.location_id,
    menuDraftId: data.menu_id,
    menuDraftVersion: data.menu_version,
    publishedByAccountId: data.published_by,
    publishedAt: data.published_at,
    isCurrent: data.is_current,
    snapshotPayload: data.snapshot_payload,
  } satisfies PublishedMenuSnapshot;
}

export async function publishMenu(
  menuId: string,
  options?: { staff?: StaffAssignment; lastSeenVersion?: number },
) {
  const menu = await getManagerMenu(menuId);
  if (!menu) throw new Error("Menu not found");
  if (options?.staff) assertCanManageMenus(options.staff, menu.locationId);
  if (
    options?.lastSeenVersion !== undefined &&
    validateDraftVersionForSave(
      options.lastSeenVersion,
      menu.currentVersion ?? 1,
    ).ok === false
  ) {
    return {
      blocked: true as const,
      issues: [
        "This menu changed in another session. Review before publishing.",
      ],
    };
  }

  const menuGate = validateMenuForPublish(menu);
  const warningGate = validateImportWarningsForPublish(
    await listImportWarnings(menuId),
  );
  const issues = [...menuGate.issues, ...warningGate.issues];
  if (issues.length > 0) return { blocked: true as const, issues };

  const client = createServiceRoleClient();
  await client
    .from("published_menu_snapshots")
    .update({ is_current: false })
    .eq("location_id", menu.locationId)
    .eq("is_current", true);
  await client
    .from("menus")
    .update({ status: "archived" })
    .eq("location_id", menu.locationId)
    .eq("status", "published");
  const { error } = await client
    .from("menus")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", menuId);
  if (error) throw error;
  const published = await getManagerMenu(menuId);
  if (!published) throw new Error("Menu not found after publish.");
  const snapshot = await writePublishedSnapshot({
    menu: published,
    staff: options?.staff,
  });
  return { blocked: false as const, menu: published, snapshot };
}

export async function getCurrentPublishedMenuSnapshot(
  locationId: string,
): Promise<PublishedMenuSnapshot | null> {
  const { data, error } = await createServiceRoleClient()
    .from("published_menu_snapshots")
    .select(
      "id,restaurant_id,location_id,menu_id,menu_version,published_by,published_at,is_current,snapshot_payload",
    )
    .eq("location_id", locationId)
    .eq("is_current", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    restaurantId: data.restaurant_id,
    locationId: data.location_id,
    menuDraftId: data.menu_id,
    menuDraftVersion: data.menu_version,
    publishedByAccountId: data.published_by,
    publishedAt: data.published_at,
    isCurrent: data.is_current,
    snapshotPayload: data.snapshot_payload,
  };
}

export async function setItemAvailability(
  menuId: string,
  itemId: string,
  isAvailable: boolean,
) {
  const menu = await getManagerMenu(menuId);
  if (!menu) throw new Error("Menu not found");
  const item = menu.sections
    .flatMap((section) => section.items)
    .find((candidate) => candidate.id === itemId);
  if (!item) throw new Error("Menu item not found");
  const { error } = await createServiceRoleClient()
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);
  if (error) throw error;
  const updated = await getManagerMenu(menuId);
  if (!updated) throw new Error("Menu not found after availability update.");
  return updated;
}

function normalizeImportedPrice(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  if (!Number.isInteger(value) || Math.abs(value) < 100) {
    return Math.round(value * 100);
  }
  return Math.round(value);
}

export async function createMenuDraftFromAiImport(input: {
  locationId: string;
  restaurantId: string;
  importJobId: string;
  title: string;
  currency: string;
  draft: AiMenuDraftResponse;
}) {
  const client = createServiceRoleClient();
  const { data: menuRow, error: menuError } = await client
    .from("menus")
    .insert({
      restaurant_id: input.restaurantId,
      location_id: input.locationId,
      title: input.title,
      status: "draft",
      source_import_id: input.importJobId,
      current_version: 1,
    })
    .select("id")
    .single();
  if (menuError) throw menuError;

  for (const [sectionIndex, category] of input.draft.categories.entries()) {
    const { data: sectionRow, error: sectionError } = await client
      .from("menu_sections")
      .insert({
        menu_id: menuRow.id,
        name: category.name,
        description: category.description ?? "",
        sort_order: sectionIndex,
      })
      .select("id")
      .single();
    if (sectionError) throw sectionError;

    for (const [itemIndex, item] of category.items.entries()) {
      const { data: itemRow, error: itemError } = await client
        .from("menu_items")
        .insert({
          section_id: sectionRow.id,
          name: item.name,
          description: item.description ?? "",
          price: normalizeImportedPrice(item.price),
          currency: item.currency ?? input.currency,
          is_available: item.available ?? true,
          sort_order: itemIndex,
          confidence_flags: item.warnings ?? [],
        })
        .select("id")
        .single();
      if (itemError) throw itemError;

      for (const [optionIndex, optionGroup] of (
        item.optionGroups ?? []
      ).entries()) {
        const { data: optionRow, error: optionError } = await client
          .from("menu_item_options")
          .insert({
            menu_item_id: itemRow.id,
            name: optionGroup.name,
            is_required: optionGroup.required ?? false,
            min_choices: optionGroup.minChoices ?? 0,
            max_choices:
              optionGroup.maxChoices ??
              Math.max(
                optionGroup.values.length,
                optionGroup.minChoices ?? 0,
                1,
              ),
            sort_order: optionIndex,
          })
          .select("id")
          .single();
        if (optionError) throw optionError;

        for (const [valueIndex, value] of optionGroup.values.entries()) {
          const { error: valueError } = await client
            .from("menu_item_option_values")
            .insert({
              option_id: optionRow.id,
              name: value.name,
              price_delta: normalizeImportedPrice(value.priceDelta),
              is_available: value.available ?? true,
              sort_order: valueIndex,
            });
          if (valueError) throw valueError;
        }
      }
    }
  }

  for (const warning of input.draft.warnings) {
    const { error: warningError } = await client
      .from("import_warnings")
      .insert({
        menu_import_id: input.importJobId,
        menu_id: menuRow.id,
        target_type: "draft",
        severity: warning.severity,
        field_name: warning.fieldName,
        message: warning.message,
        source_excerpt: warning.sourceExcerpt ?? "",
      });
    if (warningError) throw warningError;
  }

  const menu = await getManagerMenu(menuRow.id);
  if (!menu) throw new Error("Imported menu draft could not be loaded.");
  return menu;
}
