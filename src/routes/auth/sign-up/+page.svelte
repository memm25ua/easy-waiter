<script lang="ts">
  let { data, form } = $props();
  const d = $derived(data.dictionary);
  const values = $derived(
    (form ?? {}) as {
      message?: string;
      email?: string;
      restaurantName?: string;
      locationName?: string;
    }
  );
</script>

<main class="mx-auto max-w-xl px-4 py-12">
  <h1 class="ew-display text-4xl">{d['auth.signUp.title']}</h1>
  <form method="post" class="ew-panel mt-6 grid gap-4 p-5">
    {#if values.message}<p class="ew-alert-error px-3 py-2 text-sm">{values.message}</p>{/if}
    <label class="grid gap-1 text-sm"><span>{d['auth.email']}</span><input class="ew-input" name="email" type="email" required value={values.email ?? ''} /></label>
    <label class="grid gap-1 text-sm"><span>{d['auth.password']}</span><input class="ew-input" name="password" type="password" minlength="8" required /></label>
    <label class="grid gap-1 text-sm"><span>{d['auth.restaurantName']}</span><input class="ew-input" name="restaurantName" required value={values.restaurantName ?? ''} /></label>
    <label class="grid gap-1 text-sm"><span>{d['auth.locationName']}</span><input class="ew-input" name="locationName" required value={values.locationName ?? ''} /></label>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="grid gap-1 text-sm"><span>{d['auth.timezone']}</span><input class="ew-input" name="timezone" value="Europe/Madrid" /></label>
      <label class="grid gap-1 text-sm"><span>{d['auth.currency']}</span><input class="ew-input" name="currency" value="EUR" /></label>
    </div>
    <button class="ew-button-primary">{d['auth.signUp.submit']}</button>
  </form>
</main>
