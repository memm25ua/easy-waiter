<script lang="ts">
  import { formatMoney } from '$lib/format';
  let { data } = $props();
</script>

<div class="space-y-6">
  <div>
    <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Staff dashboard</p>
    <h2 class="mt-1 text-3xl font-semibold tracking-tight">Service overview</h2>
  </div>
  <div class="grid gap-4 md:grid-cols-3">
    <div class="rounded border border-stone-200 bg-white p-4">
      <p class="text-sm text-stone-500">Active orders</p>
      <p class="mt-2 text-3xl font-semibold">{data.activeOrders.length}</p>
    </div>
    <div class="rounded border border-stone-200 bg-white p-4">
      <p class="text-sm text-stone-500">Needs attention</p>
      <p class="mt-2 text-3xl font-semibold">{data.needsAttention.length}</p>
    </div>
    <div class="rounded border border-stone-200 bg-white p-4">
      <p class="text-sm text-stone-500">Menu status</p>
      <p class="mt-2 text-3xl font-semibold capitalize">{data.menu?.status ?? 'none'}</p>
    </div>
  </div>
  <section class="rounded border border-stone-200 bg-white p-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="font-semibold">Current orders</h3>
      <a class="rounded bg-stone-950 px-3 py-2 text-sm font-medium text-white" href="/manager/orders"
        >Open board</a
      >
    </div>
    <div class="mt-4 grid gap-3">
      {#each data.activeOrders as order}
        <article class="rounded border border-stone-200 p-3">
          <div class="flex justify-between gap-4">
            <strong>{order.tableLabel}</strong>
            <span class="capitalize">{order.status.replace('_', ' ')}</span>
          </div>
          <p class="mt-1 text-sm text-stone-600">{formatMoney(order.total, order.currency)}</p>
        </article>
      {:else}
        <p class="text-sm text-stone-600">No active orders yet.</p>
      {/each}
    </div>
  </section>
</div>
