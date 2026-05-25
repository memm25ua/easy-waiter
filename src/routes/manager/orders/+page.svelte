<script lang="ts">
  import OrderCard from '$lib/components/staff/OrderCard.svelte';
  import OrdersRealtime from '$lib/components/staff/OrdersRealtime.svelte';
  let { data, form } = $props();
  const d = $derived(data.dictionary);
  const lanes = ['new', 'accepted', 'preparing', 'ready', 'served', 'cancelled', 'needs_attention'];
</script>

<div class="space-y-6">
  <div>
    <p class="ew-eyebrow">{d['orders.eyebrow']}</p>
    <h2 class="ew-display mt-1 text-4xl">{d['orders.title']}</h2>
  </div>
  <OrdersRealtime {d} />
  {#if form?.message}<p class="ew-alert-info p-3 text-sm">{form.message}</p>{/if}
  <div class="grid gap-4 xl:grid-cols-3">
    {#each lanes as lane}
      <section class="min-h-40 rounded-xl border border-[var(--ew-hairline)] bg-[var(--ew-surface-soft)] p-3">
        <h3 class="mb-3 font-semibold capitalize">{lane.replace('_', ' ')}</h3>
        <div class="grid gap-3">
          {#each data.orders.filter((order) => order.status === lane) as order}
            <OrderCard {order} {d} />
          {:else}
            <p class="ew-muted text-sm">{d['orders.none']}</p>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</div>
