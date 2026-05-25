<script lang="ts">
  import MenuItemEditor from './MenuItemEditor.svelte';
  import type { MenuSection } from '$lib/types';

  let { section, d } = $props<{ section: MenuSection; d: Record<string, string> }>();
</script>

<section class="ew-panel p-4">
  <div>
    <h3 class="text-xl font-semibold">{section.name}</h3>
    <p class="ew-muted text-sm">{section.description}</p>
  </div>
  <div class="mt-4 grid gap-3">
    {#each section.items as item}
      <MenuItemEditor {item} {d} />
    {/each}
  </div>
</section>
