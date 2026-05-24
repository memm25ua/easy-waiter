<script lang="ts">
  import { formatMoney } from '$lib/format';
  import type { Menu } from '$lib/types';

  let { menu } = $props<{ menu: Menu }>();
</script>

<div class="space-y-5">
  {#each menu.sections as section}
    <section>
      <h3 class="text-xl font-semibold">{section.name}</h3>
      <div class="mt-3 grid gap-3">
        {#each section.items as item}
          <article class="rounded border border-stone-200 bg-white p-4">
            <div class="flex justify-between gap-4">
              <div>
                <h4 class="font-semibold">{item.name}</h4>
                <p class="mt-1 text-sm text-stone-600">{item.description}</p>
              </div>
              <span class="font-medium">{formatMoney(item.price, item.currency)}</span>
            </div>
            {#if !item.isAvailable}
              <p class="mt-3 rounded bg-red-50 px-2 py-1 text-sm text-red-700">Currently unavailable</p>
            {/if}
          </article>
        {/each}
      </div>
    </section>
  {/each}
</div>
