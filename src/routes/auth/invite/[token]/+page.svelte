<script lang="ts">
  let { data, form } = $props();
  const d = $derived(data.dictionary);
</script>

<main class="mx-auto grid min-h-screen max-w-md place-items-center px-4">
  <form method="POST" class="ew-panel grid w-full gap-4 p-6">
    <div>
      <p class="ew-eyebrow">{d['invite.eyebrow']}</p>
      <h1 class="ew-display mt-1 text-3xl">{d['invite.title']}</h1>
    </div>
    {#if form?.message}
      <p class="ew-alert-error px-3 py-2 text-sm">{form.message}</p>
    {/if}
    <p class="ew-muted text-sm">
      {d['invite.body']}
    </p>
    <button class="ew-button-primary" type="submit">
      {d['invite.submit']}
    </button>
  </form>
</main>
