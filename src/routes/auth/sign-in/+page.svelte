<script lang="ts">
  let { data, form } = $props();
  const d = $derived(data.dictionary);
  const values = $derived((form ?? {}) as { message?: string; email?: string });
</script>

<main class="mx-auto max-w-md px-4 py-12">
  <h1 class="ew-display text-4xl">{d['auth.signIn.title']}</h1>
  <form method="post" class="ew-panel mt-6 grid gap-4 p-5">
    <input type="hidden" name="next" value={data.next} />
    {#if values.message}<p class="ew-alert-error px-3 py-2 text-sm">{values.message}</p>{/if}
    <label class="grid gap-1 text-sm"><span>{d['auth.email']}</span><input class="ew-input" name="email" type="email" required value={values.email ?? ''} /></label>
    <label class="grid gap-1 text-sm"><span>{d['auth.password']}</span><input class="ew-input" name="password" type="password" required /></label>
    <button class="ew-button-primary">{d['auth.signIn.submit']}</button>
  </form>
</main>
