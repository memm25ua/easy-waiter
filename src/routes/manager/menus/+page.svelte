<script lang="ts">
  import { enhance } from "$app/forms";

  let { data, form } = $props();
  let isUploading = $state(false);
  const d = $derived(data.dictionary);
</script>

<div class="space-y-6">
  <div>
    <p class="ew-eyebrow">{d["menus.eyebrow"]}</p>
    <h2 class="ew-display mt-1 text-4xl">{d["menus.title"]}</h2>
  </div>
  <form
    method="post"
    action="?/upload"
    enctype="multipart/form-data"
    class="ew-panel p-4"
    use:enhance={() => {
      isUploading = true;
      return async ({ update }) => {
        try {
          await update();
        } finally {
          isUploading = false;
        }
      };
    }}
  >
    <label class="block text-sm font-medium" for="menuFile"
      >{d["menus.upload"]}</label
    >
    <p class="ew-muted mt-1 text-sm">{d["menus.uploadHelp"]}</p>
    <div class="mt-3 flex flex-wrap gap-3">
      <input
        id="menuFile"
        name="menuFile"
        type="file"
        accept="application/pdf,image/*"
        class="ew-input"
        disabled={isUploading}
      />
      <button class="ew-button-primary" disabled={isUploading}
        >{isUploading ? d["menus.importing"] : d["menus.createDraft"]}</button
      >
    </div>
    {#if isUploading}
      <div
        class="mt-3 rounded-md border border-[var(--ew-hairline)] px-3 py-2 text-sm"
      >
        <p class="font-medium">{d["menus.importing"]}</p>
        <p class="ew-muted mt-1">{d["menus.importingHelp"]}</p>
      </div>
    {/if}
    {#if form?.message}<p class="ew-alert-error mt-3 px-3 py-2 text-sm">
        {form.message}
      </p>{/if}
  </form>
  {#if data.latestImport}
    <section class="ew-panel p-4">
      <p class="ew-eyebrow">{d["menus.processing"]}</p>
      <h3 class="mt-1 font-semibold">{data.latestImport.menu.title}</h3>
      <p class="ew-muted mt-1 text-sm capitalize">{data.latestImport.status}</p>
      {#if data.latestImport.errorMessage}
        <p class="ew-alert-error mt-3 px-3 py-2 text-sm">
          {d["menus.importFailed"]}
          {d["menus.manualFallback"]}
        </p>
      {/if}
      {#if data.latestImport.confidenceSummary.length > 0}
        <ul class="mt-3 grid gap-2 text-sm">
          {#each data.latestImport.confidenceSummary as warning}
            <li class="rounded-md border border-[var(--ew-hairline)] px-3 py-2">
              {warning}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
  {#if data.currentPublishedMenu}
    <section class="ew-panel p-4">
      <p class="ew-eyebrow">{d["menus.published"]}</p>
      <h3 class="mt-1 font-semibold">{data.currentPublishedMenu.title}</h3>
      <p class="ew-muted mt-1 text-sm">
        {d["menus.version"]}
        {data.currentPublishedMenu.currentVersion ?? 1}
      </p>
    </section>
  {/if}
  <section class="grid gap-3">
    {#each data.menus as menu}
      <article class="ew-card p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="font-semibold">{menu.title}</h3>
            <p class="ew-muted text-sm capitalize">
              {menu.status} · {d["menus.version"]}
              {menu.currentVersion ?? 1}
            </p>
          </div>
          <a class="ew-button-secondary" href={`/manager/menus/${menu.id}`}
            >{d["menus.review"]}</a
          >
        </div>
      </article>
    {:else}
      <div class="ew-panel ew-muted p-6">
        {d["menus.none"]}
      </div>
    {/each}
  </section>
</div>
