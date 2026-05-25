<script lang="ts">
  let { data, form } = $props();
  const d = $derived(data.dictionary);
</script>

<div class="grid gap-6">
  <header>
    <p class="ew-eyebrow">{d['staff.eyebrow']}</p>
    <h2 class="ew-display mt-1 text-4xl">{d['staff.title']}</h2>
  </header>

  <form method="POST" action="?/invite" class="ew-panel grid gap-3 p-4">
    <label class="grid gap-1 text-sm">
      <span>{d['auth.email']}</span>
      <input class="ew-input" name="email" type="email" required value={form?.email ?? ""} />
    </label>
    <label class="grid gap-1 text-sm">
      <span>{d['staff.role']}</span>
      <select class="ew-input" name="role">
        <option value="staff">Staff</option>
        <option value="manager">Manager</option>
      </select>
    </label>
    {#if form?.message}
      <p class="ew-alert-info px-3 py-2 text-sm">{form.message}</p>
    {/if}
    {#if form?.invitePath}
      <p class="ew-alert-success px-3 py-2 text-sm">{form.invitePath}</p>
    {/if}
    <button class="ew-button-primary w-fit" type="submit">
      {d['staff.invite']}
    </button>
  </form>

  <section class="grid gap-2">
    {#each data.invitations as invitation}
      <article class="ew-card p-3">
        <p class="font-medium">{invitation.email}</p>
        <p class="ew-muted text-sm">{invitation.role} · {invitation.status}</p>
      </article>
    {:else}
      <p class="ew-muted rounded-lg border border-dashed border-[var(--ew-hairline)] p-4 text-sm">{d['staff.none']}</p>
    {/each}
  </section>
</div>
