<script lang="ts">
  let { children, data } = $props();
  const links = [
    { href: '/manager', label: 'Overview' },
    { href: '/manager/menus', label: 'Menus' },
    { href: '/manager/orders', label: 'Orders' },
    { href: '/manager/analytics', label: 'Analytics' }
  ];
</script>

<main class="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[14rem_1fr]">
  <aside class="space-y-4">
    <div>
      <p class="text-sm text-stone-500">{data.staff.restaurantName}</p>
      <h1 class="text-xl font-semibold">{data.staff.locationName}</h1>
    </div>
    <nav class="grid gap-1">
      {#each links as link}
        <a class="rounded px-3 py-2 text-sm font-medium hover:bg-white" href={link.href}>{link.label}</a>
      {/each}
    </nav>
  </aside>
  <section>{@render children()}</section>
</main>
