<script lang="ts">
  import type { Menu, MenuItem, MenuSection } from '$lib/types';

  let { menu, d } = $props<{ menu: Menu; d: Record<string, string> }>();
  const items = $derived(
    menu.sections
      .flatMap((section: MenuSection) => section.items)
      .filter((item: MenuItem) => item.isAvailable)
  );
  const firstOption = $derived(items[0]?.options[0] ?? null);
</script>

<form method="post" action="?/order" class="ew-panel p-4">
  <h3 class="font-semibold">{d['table.orderNow']}</h3>
  <label class="mt-3 grid gap-1 text-sm">
    <span>{d['table.item']}</span>
    <select class="ew-input" name="itemId">
      {#each items as item}
        <option value={item.id}>{item.name}</option>
      {/each}
    </select>
  </label>
  {#if firstOption}
    <input type="hidden" name="optionId" value={firstOption.id} />
    <label class="mt-3 grid gap-1 text-sm">
      <span>{firstOption.name}</span>
      <select class="ew-input" name="optionValueId">
        {#if !firstOption.isRequired}<option value="">No selection</option>{/if}
        {#each firstOption.values as value}
          {#if value.isAvailable}
            <option value={value.id}>{value.name}</option>
          {/if}
        {/each}
      </select>
    </label>
  {/if}
  <label class="mt-3 grid gap-1 text-sm">
    <span>{d['table.quantity']}</span>
    <input class="ew-input" name="quantity" type="number" min="1" value="1" />
  </label>
  <textarea
    class="ew-input mt-3 min-h-20 w-full"
    name="customerNotes"
    placeholder={d['table.notes']}></textarea>
  <button class="ew-button-primary mt-3 w-full">{d['table.submit']}</button>
</form>
