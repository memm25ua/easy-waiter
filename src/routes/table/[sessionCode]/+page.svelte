<script lang="ts">
  import AiWaiter from '$lib/components/customer/AiWaiter.svelte';
  import CartPanel from '$lib/components/customer/CartPanel.svelte';
  import MenuBrowser from '$lib/components/customer/MenuBrowser.svelte';
  import OrderStatus from '$lib/components/customer/OrderStatus.svelte';
  let { data, form } = $props();
</script>

{#if !data.session || data.session.status !== 'active'}
  <main class="mx-auto max-w-lg px-4 py-10">
    <h1 class="text-2xl font-semibold">This table session is not active</h1>
    <p class="mt-2 text-stone-600">Ask staff for a fresh table code.</p>
  </main>
{:else if !data.menu}
  <main class="mx-auto max-w-lg px-4 py-10">
    <h1 class="text-2xl font-semibold">No published menu yet</h1>
  </main>
{:else}
  <main class="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_22rem]">
    <section class="space-y-5">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-blue-700">{data.session.tableLabel}</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight">{data.menu.title}</h1>
      </div>
      {#if form?.message}<p class="rounded border border-stone-200 bg-white p-3 text-sm">{form.message}</p>{/if}
      <MenuBrowser menu={data.menu} />
    </section>
    <aside class="space-y-4">
      <CartPanel menu={data.menu} />
      <AiWaiter />
      <OrderStatus orders={data.orders} />
    </aside>
  </main>
{/if}
