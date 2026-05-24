<script lang="ts">
  import type { Order } from '$lib/types';

  let { orders } = $props<{ orders: Order[] }>();
</script>

<section class="rounded border border-stone-200 bg-white p-4">
  <h3 class="font-semibold">Order status</h3>
  <div class="mt-3 grid gap-2">
    {#each orders as order}
      <p class="rounded bg-stone-50 p-2 text-sm">#{order.id} is {order.status.replace('_', ' ')}</p>
    {:else}
      <p class="text-sm text-stone-600">Submitted orders will appear here.</p>
    {/each}
  </div>
</section>
