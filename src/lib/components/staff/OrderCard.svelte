<script lang="ts">
  import { formatMoney } from "$lib/format";
  import type { Order } from "$lib/types";
  import OrderStatusControls from "./OrderStatusControls.svelte";

  let { order, d } = $props<{ order: Order; d: Record<string, string> }>();
</script>

<article class="ew-panel p-4">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-semibold">{order.tableLabel}</h3>
      <p class="ew-muted text-sm">
        {order.source === "ai" ? d["orders.aiAssisted"] : d["orders.manual"]}
      </p>
    </div>
    <span class="ew-pill capitalize">{order.status.replace("_", " ")}</span>
  </div>
  <p class="mt-3 font-medium">{formatMoney(order.total, order.currency)}</p>
  <p class="ew-muted mt-1 text-sm">
    {order.items.length}
    {d["orders.items"]}
  </p>
  {#if order.customerNotes}<p class="ew-muted mt-2 text-sm">
      {order.customerNotes}
    </p>{/if}
  {#if order.status === "needs_attention"}
    <p class="ew-alert-warning mt-2 px-3 py-2 text-sm">
      {d["orders.reviewReason"]}: {order.customerNotes ||
        d["orders.aiAssisted"]}
    </p>
  {/if}
  <OrderStatusControls {order} {d} />
</article>
