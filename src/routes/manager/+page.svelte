<script lang="ts">
  import { formatMoney } from '$lib/format';
  let { data } = $props();
  const d = $derived(data.dictionary);
</script>

<div class="space-y-6">
  <div>
    <p class="ew-eyebrow">{d['manager.dashboard.eyebrow']}</p>
    <h2 class="ew-display mt-1 text-4xl">{d['manager.dashboard.title']}</h2>
  </div>
  <div class="grid gap-4 md:grid-cols-3">
    <div class="ew-card p-4">
      <p class="ew-muted text-sm">{d['manager.activeOrders']}</p>
      <p class="mt-2 text-3xl font-semibold">{data.activeOrders.length}</p>
    </div>
    <div class="ew-card p-4">
      <p class="ew-muted text-sm">{d['manager.needsAttention']}</p>
      <p class="mt-2 text-3xl font-semibold">{data.needsAttention.length}</p>
    </div>
    <div class="ew-card p-4">
      <p class="ew-muted text-sm">{d['manager.menuStatus']}</p>
      <p class="mt-2 text-3xl font-semibold capitalize">{data.menu?.status ?? d['common.none']}</p>
    </div>
  </div>
  <section class="ew-panel p-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="font-semibold">{d['manager.currentOrders']}</h3>
      <a class="ew-button-primary" href="/manager/orders"
        >{d['manager.openBoard']}</a
      >
    </div>
    <div class="mt-4 grid gap-3">
      {#each data.activeOrders as order}
        <article class="ew-card p-3">
          <div class="flex justify-between gap-4">
            <strong>{order.tableLabel}</strong>
            <span class="capitalize">{order.status.replace('_', ' ')}</span>
          </div>
          <p class="ew-muted mt-1 text-sm">{formatMoney(order.total, order.currency)}</p>
        </article>
      {:else}
        <p class="ew-muted text-sm">{d['manager.noActiveOrders']}</p>
      {/each}
    </div>
  </section>
</div>
