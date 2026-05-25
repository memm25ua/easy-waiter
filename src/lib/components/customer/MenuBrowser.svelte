<script lang="ts">
  import { formatMoney } from '$lib/format';
  import type { Menu } from '$lib/types';

  let { menu, d } = $props<{ menu: Menu; d: Record<string, string> }>();
</script>

<div class="space-y-5">
  {#each menu.sections as section}
    <section>
      <h3 class="ew-display text-2xl">{section.name}</h3>
      <div class="mt-3 grid gap-3">
        {#each section.items as item}
          <article class="ew-panel p-4">
            <div class="flex justify-between gap-4">
              <div>
                <h4 class="font-semibold">{item.name}</h4>
                <p class="ew-muted mt-1 text-sm">{item.description}</p>
              </div>
              <span class="font-medium">{formatMoney(item.price, item.currency)}</span>
            </div>
            {#if !item.isAvailable}
              <p class="ew-alert-error mt-3 px-2 py-1 text-sm">{d['table.unavailable']}</p>
            {/if}
          </article>
        {/each}
      </div>
    </section>
  {/each}
</div>
