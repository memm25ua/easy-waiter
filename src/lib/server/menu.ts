import { createServiceRoleClient } from "./supabase";
import type { Menu, MenuItem, MenuItemOption, MenuSection } from "$lib/types";

interface MenuRow {
  id: string;
  location_id: string;
  title: string;
  status: Menu["status"];
  published_at: string | null;
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
  id,location_id,title,status,published_at,
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
    locationId: row.location_id,
    title: row.title,
    status: row.status,
    publishedAt: row.published_at,
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
    }
  }
  const saved = await getManagerMenu(menu.id);
  if (!saved) throw new Error("Menu not found after save.");
  return saved;
}

export async function publishMenu(menuId: string) {
  const menu = await getManagerMenu(menuId);
  if (!menu) throw new Error("Menu not found");
  const client = createServiceRoleClient();
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
  return published;
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
