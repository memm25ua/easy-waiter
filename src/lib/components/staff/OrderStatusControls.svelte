<script lang="ts">
  import { getAllowedOrderStatuses } from '$lib/order-status';
  import type { Order } from '$lib/types';

  let { order } = $props<{ order: Order }>();
  const allowed = $derived(getAllowedOrderStatuses(order.status));
</script>

<form method="post" action="?/status" class="mt-3 grid gap-2">
  <input type="hidden" name="orderId" value={order.id} />
  <select class="rounded border border-stone-300 px-2 py-2 text-sm" name="status" disabled={allowed.length === 0}>
    {#each allowed as status}
      <option value={status}>{status.replace('_', ' ')}</option>
    {/each}
  </select>
  <input class="rounded border border-stone-300 px-2 py-2 text-sm" name="staffNotes" placeholder="Staff note" />
  <button class="rounded bg-stone-950 px-3 py-2 text-sm font-medium text-white" disabled={allowed.length === 0}>
    Update
  </button>
</form>
