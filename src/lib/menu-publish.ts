import type { Menu } from "./types";

export interface PublishGateResult {
  canPublish: boolean;
  issues: string[];
}

export function validateMenuForPublish(menu: Menu): PublishGateResult {
  const issues: string[] = [];

  if (!menu.title.trim()) issues.push("Menu title is required.");
  if (menu.sections.length === 0)
    issues.push("At least one section is required.");

  for (const section of menu.sections) {
    if (!section.name.trim()) issues.push("Every section needs a name.");
    for (const item of section.items) {
      if (!item.name.trim()) issues.push("Every item needs a name.");
      if (item.price < 0)
        issues.push(`${item.name || "Item"} cannot have a negative price.`);
      if (!item.currency.trim())
        issues.push(`${item.name || "Item"} needs a currency.`);
      if ((item.confidenceFlags ?? []).length > 0) {
        issues.push(`${item.name || "Item"} has unresolved import flags.`);
      }
    }
  }

  return { canPublish: issues.length === 0, issues };
}
