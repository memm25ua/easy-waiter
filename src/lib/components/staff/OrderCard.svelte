<script lang="ts">
  import { formatMoney } from '$lib/format';
  import type { Order } from '$lib/types';
  import OrderStatusControls from './OrderStatusControls.svelte';

  let { order } = $props<{ order: Order }>();
</script>

<article class="rounded border border-stone-200 bg-white p-4">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-semibold">{order.tableLabel}</h3>
      <p class="text-sm text-stone-600">{order.source === 'ai' ? 'AI-assisted' : 'Manual'} order</p>
    </div>
    <span class="rounded bg-stone-100 px-2 py-1 text-xs font-medium capitalize">{order.status.replace('_', ' ')}</span>
  </div>
  <p class="mt-3 font-medium">{formatMoney(order.total, order.currency)}</p>
  {#if order.customerNotes}<p class="mt-2 text-sm text-stone-600">{order.customerNotes}</p>{/if}
  <OrderStatusControls {order} />
</article>
