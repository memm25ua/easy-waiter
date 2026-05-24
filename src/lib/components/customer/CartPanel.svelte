<script lang="ts">
  import type { Menu, MenuItem, MenuSection } from '$lib/types';

  let { menu } = $props<{ menu: Menu }>();
  const items = $derived(
    menu.sections
      .flatMap((section: MenuSection) => section.items)
      .filter((item: MenuItem) => item.isAvailable)
  );
</script>

<form method="post" action="?/order" class="rounded border border-stone-200 bg-white p-4">
  <h3 class="font-semibold">Order now</h3>
  <label class="mt-3 grid gap-1 text-sm">
    <span>Item</span>
    <select class="rounded border border-stone-300 px-3 py-2" name="itemId">
      {#each items as item}
        <option value={item.id}>{item.name}</option>
      {/each}
    </select>
  </label>
  <label class="mt-3 grid gap-1 text-sm">
    <span>Side</span>
    <select class="rounded border border-stone-300 px-3 py-2" name="side">
      <option value="">No side needed</option>
      <option value="side-salad">Green salad</option>
      <option value="side-potatoes">Lemon potatoes</option>
    </select>
  </label>
  <label class="mt-3 grid gap-1 text-sm">
    <span>Quantity</span>
    <input class="rounded border border-stone-300 px-3 py-2" name="quantity" type="number" min="1" value="1" />
  </label>
  <textarea
    class="mt-3 min-h-20 w-full rounded border border-stone-300 px-3 py-2"
    name="customerNotes"
    placeholder="Notes for the kitchen"></textarea>
  <button class="mt-3 w-full rounded bg-stone-950 px-4 py-3 font-medium text-white">Submit order</button>
</form>
