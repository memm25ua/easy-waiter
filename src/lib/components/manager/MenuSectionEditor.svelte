<script lang="ts">
  import MenuItemEditor from './MenuItemEditor.svelte';
  import type { MenuSection } from '$lib/types';

  let { section } = $props<{ section: MenuSection }>();
</script>

<section class="rounded border border-stone-200 bg-white p-4">
  <div>
    <h3 class="text-xl font-semibold">{section.name}</h3>
    <p class="text-sm text-stone-600">{section.description}</p>
  </div>
  <div class="mt-4 grid gap-3">
    {#each section.items as item}
      <MenuItemEditor {item} />
    {/each}
  </div>
</section>
