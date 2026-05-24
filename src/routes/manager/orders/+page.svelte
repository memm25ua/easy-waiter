<script lang="ts">
  import OrderCard from '$lib/components/staff/OrderCard.svelte';
  import OrdersRealtime from '$lib/components/staff/OrdersRealtime.svelte';
  let { data, form } = $props();
  const lanes = ['new', 'accepted', 'preparing', 'ready', 'served', 'cancelled', 'needs_attention'];
</script>

<div class="space-y-6">
  <div>
    <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Orders</p>
    <h2 class="mt-1 text-3xl font-semibold tracking-tight">Staff order board</h2>
  </div>
  <OrdersRealtime />
  {#if form?.message}<p class="rounded border border-stone-200 bg-white p-3 text-sm">{form.message}</p>{/if}
  <div class="grid gap-4 xl:grid-cols-3">
    {#each lanes as lane}
      <section class="min-h-40 rounded border border-stone-200 bg-stone-100 p-3">
        <h3 class="mb-3 font-semibold capitalize">{lane.replace('_', ' ')}</h3>
        <div class="grid gap-3">
          {#each data.orders.filter((order) => order.status === lane) as order}
            <OrderCard {order} />
          {:else}
            <p class="text-sm text-stone-600">No orders.</p>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</div>
