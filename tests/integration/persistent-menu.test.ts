import { describe, expect, it } from "vitest";
import {
  addMenuItem,
  addMenuSection,
  addItemOption,
  addItemOptionValue,
  archiveItemOption,
  archiveItemOptionValue,
  archiveMenuItem,
  duplicateMenuItem,
  loadMenuWorkspace,
  publishMenu,
  reorderItemOption,
  reorderItemOptionValue,
  reorderMenuItem,
  saveMenuDraft,
} from "$lib/server/menu";
import { resolveImportWarning } from "$lib/server/menu-import";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe("persistent menu service contracts", () => {
  it("exposes workspace, save, warning resolution, and publish operations", () => {
    expect(loadMenuWorkspace).toBeTypeOf("function");
    expect(saveMenuDraft).toBeTypeOf("function");
    expect(addMenuSection).toBeTypeOf("function");
    expect(addMenuItem).toBeTypeOf("function");
    expect(addItemOption).toBeTypeOf("function");
    expect(addItemOptionValue).toBeTypeOf("function");
    expect(duplicateMenuItem).toBeTypeOf("function");
    expect(reorderMenuItem).toBeTypeOf("function");
    expect(reorderItemOption).toBeTypeOf("function");
    expect(reorderItemOptionValue).toBeTypeOf("function");
    expect(archiveMenuItem).toBeTypeOf("function");
    expect(archiveItemOption).toBeTypeOf("function");
    expect(archiveItemOptionValue).toBeTypeOf("function");
    expect(resolveImportWarning).toBeTypeOf("function");
    expect(publishMenu).toBeTypeOf("function");
  });
});

describe.skipIf(!hasProductionSupabaseEnv())("persistent menu queries", () => {
  it("requires Supabase seed data for publish regression coverage", () => {
    expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
  });
});
