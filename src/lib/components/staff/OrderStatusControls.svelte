<script lang="ts">
  import { getAllowedOrderStatuses } from '$lib/order-status';
  import type { Order } from '$lib/types';

  let { order, d } = $props<{ order: Order; d: Record<string, string> }>();
  const allowed = $derived(getAllowedOrderStatuses(order.status));
</script>

<form method="post" action="?/status" class="mt-3 grid gap-2">
  <input type="hidden" name="orderId" value={order.id} />
  <select class="ew-input text-sm" name="status" disabled={allowed.length === 0}>
    {#each allowed as status}
      <option value={status}>{status.replace('_', ' ')}</option>
    {/each}
  </select>
  <input class="ew-input text-sm" name="staffNotes" placeholder={d['orders.staffNote']} />
  <button class="ew-button-primary" disabled={allowed.length === 0}>
    {d['orders.update']}
  </button>
</form>
