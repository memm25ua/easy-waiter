<script lang="ts">
  import {
    formatCustomerOrderStatus,
    isCustomerVisibleOrderStatus,
  } from "$lib/order-status";
  import type { Order } from "$lib/types";

  let { orders, d } = $props<{ orders: Order[]; d: Record<string, string> }>();
  const visibleOrders = $derived(
    orders.filter((order: Order) => isCustomerVisibleOrderStatus(order.status)),
  );
</script>

<section class="ew-panel p-4">
  <h3 class="font-semibold">{d["order.status"]}</h3>
  <div class="mt-3 grid gap-2">
    {#each visibleOrders as order}
      <p class="rounded-lg bg-[var(--ew-surface-soft)] p-2 text-sm">
        #{order.id} · {formatCustomerOrderStatus(order.status)}
      </p>
    {:else}
      <p class="ew-muted text-sm">{d["order.empty"]}</p>
    {/each}
  </div>
</section>
