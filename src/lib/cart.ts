import type { CartItem, Menu, MenuItem, ValidatedCart } from "./types";

export function findMenuItem(
  menu: Menu,
  menuItemId: string,
): MenuItem | undefined {
  return menu.sections
    .flatMap((section) => section.items)
    .find((item) => item.id === menuItemId);
}

export function validateCart(menu: Menu, cartItems: CartItem[]): ValidatedCart {
  const issues: ValidatedCart["issues"] = [];
  let total = 0;
  const currency = menu.sections[0]?.items[0]?.currency ?? "EUR";

  for (const cartItem of cartItems) {
    const menuItem = findMenuItem(menu, cartItem.menuItemId);
    if (!menuItem) {
      issues.push({
        code: "missing_item",
        message: "Item is no longer on the menu.",
      });
      continue;
    }

    if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
      issues.push({
        code: "invalid_quantity",
        message: `${menuItem.name} needs a valid quantity.`,
        menuItemId: menuItem.id,
      });
      continue;
    }

    if (!menuItem.isAvailable) {
      issues.push({
        code: "unavailable_item",
        message: `${menuItem.name} is currently unavailable.`,
        menuItemId: menuItem.id,
      });
      continue;
    }

    let itemTotal = menuItem.price;
    for (const option of menuItem.options) {
      const selection = cartItem.selections.find(
        (candidate) => candidate.optionId === option.id,
      );
      const selectedValueIds = selection?.valueIds ?? [];

      if (option.isRequired && selectedValueIds.length === 0) {
        issues.push({
          code: "missing_required_option",
          message: `${option.name} is required for ${menuItem.name}.`,
          menuItemId: menuItem.id,
        });
      }
      if (selectedValueIds.length < option.minChoices) {
        issues.push({
          code: "too_few_options",
          message: `Choose at least ${option.minChoices} for ${option.name}.`,
          menuItemId: menuItem.id,
        });
      }
      if (selectedValueIds.length > option.maxChoices) {
        issues.push({
          code: "too_many_options",
          message: `Choose no more than ${option.maxChoices} for ${option.name}.`,
          menuItemId: menuItem.id,
        });
      }

      for (const valueId of selectedValueIds) {
        const value = option.values.find(
          (candidate) => candidate.id === valueId,
        );
        if (!value) {
          issues.push({
            code: "unknown_option_value",
            message: `A selected option for ${menuItem.name} is not valid.`,
            menuItemId: menuItem.id,
          });
          continue;
        }
        if (!value.isAvailable) {
          issues.push({
            code: "unavailable_option_value",
            message: `${value.name} is currently unavailable.`,
            menuItemId: menuItem.id,
          });
          continue;
        }
        itemTotal += value.priceDelta;
      }
    }

    total += itemTotal * cartItem.quantity;
  }

  return { issues, total, currency };
}

export function cartHasBlockingIssues(validation: ValidatedCart): boolean {
  return validation.issues.length > 0;
}
