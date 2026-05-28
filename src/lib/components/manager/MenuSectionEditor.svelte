<script lang="ts">
  import MenuItemEditor from "./MenuItemEditor.svelte";
  import type { MenuSection } from "$lib/types";

  let { section, d } = $props<{
    section: MenuSection;
    d: Record<string, string>;
  }>();
</script>

<section class="ew-panel p-4">
  <div class="grid gap-3 md:grid-cols-[1fr_1.4fr]">
    <label class="grid gap-1 text-sm">
      <span class="font-medium">{d["menus.sectionName"]}</span>
      <input
        class="ew-input"
        name={`sectionName:${section.id}`}
        value={section.name}
      />
    </label>
    <label class="grid gap-1 text-sm">
      <span class="font-medium">{d["menus.sectionDescription"]}</span>
      <input
        class="ew-input"
        name={`sectionDescription:${section.id}`}
        value={section.description}
      />
    </label>
  </div>
  <div class="mt-4 grid gap-3">
    {#each section.items as item}
      <MenuItemEditor {item} {d} />
    {/each}
  </div>
</section>
