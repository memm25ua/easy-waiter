import { demoMenu } from "./demo-data";
import type { Menu } from "$lib/types";

let currentMenu: Menu = structuredClone(demoMenu);

export async function getPublishedMenu(
  locationId: string,
): Promise<Menu | null> {
  if (
    currentMenu.locationId !== locationId ||
    currentMenu.status !== "published"
  )
    return null;
  return structuredClone(currentMenu);
}

export async function getManagerMenu(
  menuId = currentMenu.id,
): Promise<Menu | null> {
  if (menuId !== currentMenu.id) return null;
  return structuredClone(currentMenu);
}

export async function listManagerMenus(locationId: string) {
  if (locationId !== currentMenu.locationId) return [];
  return [structuredClone(currentMenu)];
}

export async function saveMenu(menu: Menu) {
  currentMenu = structuredClone(menu);
  return structuredClone(currentMenu);
}

export async function publishMenu(menuId: string) {
  if (menuId !== currentMenu.id) throw new Error("Menu not found");
  currentMenu.status = "published";
  currentMenu.publishedAt = new Date().toISOString();
  return structuredClone(currentMenu);
}

export async function setItemAvailability(
  menuId: string,
  itemId: string,
  isAvailable: boolean,
) {
  if (menuId !== currentMenu.id) throw new Error("Menu not found");
  for (const section of currentMenu.sections) {
    const item = section.items.find((candidate) => candidate.id === itemId);
    if (item) {
      item.isAvailable = isAvailable;
      return structuredClone(currentMenu);
    }
  }
  throw new Error("Menu item not found");
}
