<script lang="ts">
  let { form, d } = $props<{ form?: { message?: string; leadError?: string }; d: Record<string, string> }>();
</script>

<form method="post" action="?/lead" class="grid gap-3 border-t border-[var(--ew-hairline)] pt-5">
  <div class="grid gap-3 sm:grid-cols-2">
    <label class="grid gap-1 text-sm">
      <span>{d['lead.email']}</span>
      <input class="ew-input" name="email" type="email" required />
    </label>
    <label class="grid gap-1 text-sm">
      <span>{d['lead.restaurant']}</span>
      <input class="ew-input" name="restaurantName" />
    </label>
  </div>
  <label class="grid gap-1 text-sm">
    <span>{d['lead.message']}</span>
    <textarea class="ew-input min-h-24" name="message"></textarea>
  </label>
  {#if form?.leadError}
    <p class="ew-alert-error px-3 py-2 text-sm">{form.leadError}</p>
  {:else if form?.message}
    <p class="ew-alert-success px-3 py-2 text-sm">{form.message}</p>
  {/if}
  <button class="ew-button-primary w-fit">{d['lead.submit']}</button>
</form>
