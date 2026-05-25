<script lang="ts">
  import MenuSectionEditor from '$lib/components/manager/MenuSectionEditor.svelte';
  let { data, form } = $props();
  const d = $derived(data.dictionary);
</script>

{#if data.menu}
  <div class="space-y-6">
    <div>
      <p class="ew-eyebrow">{d['menus.reviewEyebrow']}</p>
      <h2 class="ew-display mt-1 text-4xl">{data.menu.title}</h2>
    </div>
    {#if form?.message}<p class="ew-alert-info p-3 text-sm">{form.message}</p>{/if}
    <form method="post" action="?/save" class="space-y-4">
      <label class="grid gap-1 text-sm">
        <span class="font-medium">{d['menus.menuTitle']}</span>
        <input class="ew-input" name="title" value={data.menu.title} />
      </label>
      {#each data.menu.sections as section}
        <MenuSectionEditor {section} {d} />
      {/each}
      <div class="flex flex-wrap gap-3">
        <button class="ew-button-primary">{d['menus.save']}</button>
        <button formaction="?/publish" class="ew-button-secondary">
          {d['menus.publish']}
        </button>
      </div>
    </form>
    <section class="ew-panel p-4">
      <h3 class="font-semibold">{d['menus.availability']}</h3>
      <div class="mt-3 grid gap-2">
        {#each data.menu.sections.flatMap((section) => section.items) as item}
          <form method="post" action="?/availability" class="flex items-center justify-between gap-3 rounded-lg border border-[var(--ew-hairline)] p-3">
            <input type="hidden" name="itemId" value={item.id} />
            <span>{item.name}</span>
            <button
              name="isAvailable"
              value={item.isAvailable ? 'false' : 'true'}
              class="ew-button-secondary"
            >
              {item.isAvailable ? d['menus.markUnavailable'] : d['menus.markAvailable']}
            </button>
          </form>
        {/each}
      </div>
    </section>
  </div>
{:else}
  <p class="ew-panel p-6">{d['menus.notFound']}</p>
{/if}
