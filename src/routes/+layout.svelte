<script lang="ts">
  import '../app.css';

  let { children, data } = $props();
</script>

<svelte:head>
  <title>Easy Waiter</title>
  <meta
    name="description"
    content="Dine-in menu import, customer ordering, AI waiter, and staff order monitoring."
  />
</svelte:head>

<div class="min-h-screen bg-stone-50 text-stone-950">
  <header class="border-b border-stone-200 bg-white">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <a href="/" class="text-lg font-semibold tracking-tight">Easy Waiter</a>
      <div class="flex items-center gap-2 text-sm">
        <a class="rounded px-3 py-2 hover:bg-stone-100" href="/manager">Manager</a>
        <a class="rounded px-3 py-2 hover:bg-stone-100" href="/table/DEMO-1">Demo table</a>
        {#if data?.staff}
          <span class="hidden rounded bg-emerald-50 px-2 py-1 text-emerald-800 sm:inline"
            >{data.staff.role}</span
          >
        {/if}
      </div>
    </nav>
  </header>
  {@render children()}
</div>
