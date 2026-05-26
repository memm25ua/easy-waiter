<script lang="ts">
  let { data } = $props();
  const d = $derived(data.dictionary);
</script>

<main class="mx-auto max-w-xl px-4 py-12 text-center">
  <h1 class="ew-display text-4xl">{d['auth.checkEmail.title']}</h1>
  <p class="mt-4 text-gray-600">{d['auth.checkEmail.body']}</p>
  {#if data.email}
    <p class="mt-2 font-medium">{data.email}</p>
  {/if}
  <p class="mt-6 text-sm text-gray-500">{d['auth.checkEmail.hint']}</p>
  <a href="/auth/sign-in" class="ew-button-primary mt-6 inline-block">{d['nav.signIn']}</a>
</main>
