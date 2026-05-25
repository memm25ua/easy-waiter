<script lang="ts">
  let { data, form } = $props();
  const d = $derived(data.dictionary);
</script>

<div class="space-y-6">
  <div>
    <p class="ew-eyebrow">{d['menus.eyebrow']}</p>
    <h2 class="ew-display mt-1 text-4xl">{d['menus.title']}</h2>
  </div>
  <form
    method="post"
    action="?/upload"
    enctype="multipart/form-data"
    class="ew-panel p-4"
  >
    <label class="block text-sm font-medium" for="menuFile">{d['menus.upload']}</label>
    <div class="mt-3 flex flex-wrap gap-3">
      <input id="menuFile" name="menuFile" type="file" accept="application/pdf,image/*" class="ew-input" />
      <button class="ew-button-primary">{d['menus.createDraft']}</button>
    </div>
    {#if form?.message}<p class="ew-alert-error mt-3 px-3 py-2 text-sm">{form.message}</p>{/if}
  </form>
  <section class="grid gap-3">
    {#each data.menus as menu}
      <article class="ew-card p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="font-semibold">{menu.title}</h3>
            <p class="ew-muted text-sm capitalize">{menu.status}</p>
          </div>
          <a class="ew-button-secondary" href={`/manager/menus/${menu.id}`}
            >{d['menus.review']}</a
          >
        </div>
      </article>
    {:else}
      <div class="ew-panel ew-muted p-6">
        {d['menus.none']}
      </div>
    {/each}
  </section>
</div>
