<script lang="ts">
  import { formatMoney } from '$lib/format';
  import type { MenuItem } from '$lib/types';

  let { item, d } = $props<{ item: MenuItem; d: Record<string, string> }>();
</script>

<article class="rounded-lg border border-[var(--ew-hairline)] bg-[var(--ew-surface-soft)] p-4">
  <div class="grid gap-3 md:grid-cols-[1fr_9rem]">
    <label class="grid gap-1 text-sm">
      <span class="font-medium">{d['menus.itemName']}</span>
      <input class="ew-input" name={`name:${item.id}`} value={item.name} />
    </label>
    <label class="grid gap-1 text-sm">
      <span class="font-medium">{d['menus.price']}</span>
      <input
        class="ew-input"
        name={`price:${item.id}`}
        type="number"
        step="0.01"
        min="0"
        value={(item.price / 100).toFixed(2)}
      />
    </label>
  </div>
  <label class="mt-3 grid gap-1 text-sm">
    <span class="font-medium">{d['menus.description']}</span>
    <textarea class="ew-input min-h-20" name={`description:${item.id}`}
      >{item.description}</textarea
    >
  </label>
  <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
    <span class={item.isAvailable ? 'text-[#2d6d3d]' : 'text-[var(--ew-error)]'}>
      {item.isAvailable ? d['menus.available'] : d['menus.unavailable']}
    </span>
    <span class="ew-muted">{formatMoney(item.price, item.currency)}</span>
    {#each item.confidenceFlags ?? [] as flag}
      <span class="ew-alert-warning px-2 py-1">{d['menus.reviewFlag']} {flag}</span>
    {/each}
    {#each item.suggestions ?? [] as suggestion}
      <span class="ew-alert-info px-2 py-1">{suggestion}</span>
    {/each}
  </div>
</article>
