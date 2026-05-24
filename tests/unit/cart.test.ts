import { describe, expect, it } from "vitest";
import { validateCart } from "$lib/cart";
import { demoMenu } from "$lib/server/demo-data";

describe("cart validation", () => {
  it("calculates totals with required options", () => {
    const result = validateCart(demoMenu, [
      {
        menuItemId: "item-rice",
        quantity: 2,
        selections: [{ optionId: "option-side", valueIds: ["side-potatoes"] }],
      },
    ]);
    expect(result.issues).toEqual([]);
    expect(result.total).toBe(3200);
  });

  it("blocks unavailable items and missing required options", () => {
    expect(
      validateCart(demoMenu, [
        { menuItemId: "item-croquettes", quantity: 1, selections: [] },
      ]).issues[0].code,
    ).toBe("unavailable_item");
    expect(
      validateCart(demoMenu, [
        { menuItemId: "item-rice", quantity: 1, selections: [] },
      ]).issues[0].code,
    ).toBe("missing_required_option");
  });
});
