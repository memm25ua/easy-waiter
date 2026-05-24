import { describe, expect, it } from "vitest";
import { validateMenuForPublish } from "$lib/menu-publish";
import { demoMenu } from "$lib/server/demo-data";

describe("menu publish gate", () => {
  it("allows valid menus", () => {
    expect(validateMenuForPublish(demoMenu).canPublish).toBe(true);
  });

  it("blocks unresolved flags and invalid prices", () => {
    const menu = structuredClone(demoMenu);
    menu.sections[0].items[0].confidenceFlags = ["price"];
    menu.sections[0].items[1].price = -1;
    const result = validateMenuForPublish(menu);
    expect(result.canPublish).toBe(false);
    expect(result.issues.join(" ")).toContain("unresolved");
    expect(result.issues.join(" ")).toContain("negative");
  });
});
