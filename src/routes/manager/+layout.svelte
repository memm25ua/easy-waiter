<script lang="ts">
  let { children, data } = $props();
  const d = $derived(data.dictionary);
  const links = $derived([
    { href: '/manager', label: d['manager.overview'] },
    { href: '/manager/menus', label: d['manager.menus'] },
    { href: '/manager/orders', label: d['manager.orders'] },
    { href: '/manager/analytics', label: d['manager.analytics'] },
    { href: '/manager/staff', label: d['manager.staff'] }
  ]);
</script>

<main class="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[14rem_1fr]">
  <aside class="space-y-4">
    <div>
      <p class="ew-muted text-sm">{data.staff.restaurantName}</p>
      <h1 class="ew-display text-2xl">{data.staff.locationName}</h1>
    </div>
    <nav class="grid gap-1">
      {#each links as link}
        <a class="rounded-md px-3 py-2 text-sm font-medium hover:bg-[var(--ew-surface-soft)]" href={link.href}>{link.label}</a>
      {/each}
    </nav>
  </aside>
  <section>{@render children()}</section>
</main>
