<script lang="ts">
  import AiWaiter from "$lib/components/customer/AiWaiter.svelte";
  import CartPanel from "$lib/components/customer/CartPanel.svelte";
  import MenuBrowser from "$lib/components/customer/MenuBrowser.svelte";
  import OrderStatus from "$lib/components/customer/OrderStatus.svelte";
  let { data, form } = $props();
  const d = $derived(data.dictionary);
  const aiItem = $derived(
    data.menu?.sections
      .flatMap((section) => section.items)
      .find((item) => item.isAvailable),
  );
  const aiOption = $derived(aiItem?.options[0]);
  const aiValue = $derived(aiOption?.values.find((value) => value.isAvailable));
</script>

{#if !data.session || data.session.status !== "active"}
  <main class="mx-auto max-w-lg px-4 py-10">
    <h1 class="ew-display text-3xl">
      {data.blockedReason === "invalid_link"
        ? d["table.link.invalid"]
        : data.blockedReason === "no_active_session"
          ? d["table.link.noSession"]
          : d["table.inactive.title"]}
    </h1>
    <p class="ew-muted mt-2">
      {data.blockedReason === "closed_session"
        ? d["table.link.closed"]
        : d["table.inactive.body"]}
    </p>
  </main>
{:else if !data.menu}
  <main class="mx-auto max-w-lg px-4 py-10">
    <h1 class="ew-display text-3xl">{d["table.noMenu"]}</h1>
    <p class="ew-muted mt-2">{d["table.noMenu.body"]}</p>
  </main>
{:else}
  <main class="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_22rem]">
    <section class="space-y-5">
      <div>
        <p class="ew-eyebrow">{data.session.tableLabel}</p>
        <h1 class="ew-display mt-1 text-4xl">{data.menu.title}</h1>
      </div>
      {#if form?.message}<p class="ew-alert-info p-3 text-sm">
          {form.message}
        </p>{/if}
      <MenuBrowser menu={data.menu} {d} />
    </section>
    <aside class="space-y-4">
      <CartPanel menu={data.menu} {d} />
      <AiWaiter
        defaultItem={aiItem?.id ?? ""}
        defaultOption={aiOption?.id ?? ""}
        defaultValue={aiValue?.id ?? ""}
        {d}
      />
      <OrderStatus orders={data.orders} {d} />
    </aside>
  </main>
{/if}
