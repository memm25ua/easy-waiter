<script lang="ts">
  import '../app.css';
  import LanguageSelector from '$lib/components/shared/LanguageSelector.svelte';
  import { onMount } from 'svelte';

  let { children, data } = $props();
  const d = $derived(data.dictionary);

  onMount(() => {
    document.body.dataset.hydrated = 'true';
  });
</script>

<svelte:head>
  <title>Easy Waiter</title>
  <meta name="description" content={d['app.description']} />
</svelte:head>

<div class="ew-canvas min-h-screen">
  <header class="border-b" style="border-color: var(--ew-hairline); background: var(--ew-canvas);">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <a href="/" class="ew-display text-xl">Easy Waiter</a>
      <div class="flex items-center gap-2 text-sm">
        {#if data?.staff}
          <a class="rounded-md px-3 py-2 hover:bg-[var(--ew-surface-soft)]" href="/manager">{d['nav.dashboard']}</a>
          <form method="post" action="/auth/sign-out">
            <button class="rounded-md px-3 py-2 hover:bg-[var(--ew-surface-soft)]">{d['nav.signOut']}</button>
          </form>
        {:else}
          <a class="rounded-md px-3 py-2 hover:bg-[var(--ew-surface-soft)]" href="/auth/sign-in">{d['nav.signIn']}</a>
          <a class="ew-button-primary" href="/auth/sign-up">{d['nav.startSetup']}</a>
        {/if}
        {#if data?.staff}
          <span class="ew-pill hidden sm:inline">{data.staff.role}</span>
        {/if}
        <LanguageSelector
          locale={data.locale}
          label={d['language.label']}
          english={d['language.en']}
          spanish={d['language.es']}
        />
      </div>
    </nav>
  </header>
  {@render children()}
</div>
