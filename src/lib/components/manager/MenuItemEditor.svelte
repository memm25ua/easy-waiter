<script lang="ts">
  import { formatMoney } from '$lib/format';
  import type { MenuItem } from '$lib/types';

  let { item } = $props<{ item: MenuItem }>();
</script>

<article class="rounded border border-stone-200 p-4">
  <div class="grid gap-3 md:grid-cols-[1fr_9rem]">
    <label class="grid gap-1 text-sm">
      <span class="font-medium">Item name</span>
      <input class="rounded border border-stone-300 px-3 py-2" name={`name:${item.id}`} value={item.name} />
    </label>
    <label class="grid gap-1 text-sm">
      <span class="font-medium">Price</span>
      <input
        class="rounded border border-stone-300 px-3 py-2"
        name={`price:${item.id}`}
        type="number"
        step="0.01"
        min="0"
        value={(item.price / 100).toFixed(2)}
      />
    </label>
  </div>
  <label class="mt-3 grid gap-1 text-sm">
    <span class="font-medium">Description</span>
    <textarea class="min-h-20 rounded border border-stone-300 px-3 py-2" name={`description:${item.id}`}
      >{item.description}</textarea
    >
  </label>
  <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
    <span class={item.isAvailable ? 'text-emerald-700' : 'text-red-700'}>
      {item.isAvailable ? 'Available' : 'Unavailable'}
    </span>
    <span class="text-stone-500">{formatMoney(item.price, item.currency)}</span>
    {#each item.confidenceFlags ?? [] as flag}
      <span class="rounded bg-amber-50 px-2 py-1 text-amber-800">Review {flag}</span>
    {/each}
    {#each item.suggestions ?? [] as suggestion}
      <span class="rounded bg-blue-50 px-2 py-1 text-blue-800">{suggestion}</span>
    {/each}
  </div>
</article>
