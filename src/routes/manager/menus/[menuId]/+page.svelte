<script lang="ts">
  import MenuSectionEditor from '$lib/components/manager/MenuSectionEditor.svelte';
  let { data, form } = $props();
</script>

{#if data.menu}
  <div class="space-y-6">
    <div>
      <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Review menu</p>
      <h2 class="mt-1 text-3xl font-semibold tracking-tight">{data.menu.title}</h2>
    </div>
    {#if form?.message}<p class="rounded border border-stone-200 bg-white p-3 text-sm">{form.message}</p>{/if}
    <form method="post" action="?/save" class="space-y-4">
      <label class="grid gap-1 text-sm">
        <span class="font-medium">Menu title</span>
        <input class="rounded border border-stone-300 px-3 py-2" name="title" value={data.menu.title} />
      </label>
      {#each data.menu.sections as section}
        <MenuSectionEditor {section} />
      {/each}
      <div class="flex flex-wrap gap-3">
        <button class="rounded bg-stone-950 px-4 py-2 font-medium text-white">Save review</button>
        <button formaction="?/publish" class="rounded border border-stone-300 px-4 py-2 font-medium">
          Publish
        </button>
      </div>
    </form>
    <section class="rounded border border-stone-200 bg-white p-4">
      <h3 class="font-semibold">Availability</h3>
      <div class="mt-3 grid gap-2">
        {#each data.menu.sections.flatMap((section) => section.items) as item}
          <form method="post" action="?/availability" class="flex items-center justify-between gap-3 rounded border p-3">
            <input type="hidden" name="itemId" value={item.id} />
            <span>{item.name}</span>
            <button
              name="isAvailable"
              value={item.isAvailable ? 'false' : 'true'}
              class="rounded border border-stone-300 px-3 py-1 text-sm"
            >
              Mark {item.isAvailable ? 'unavailable' : 'available'}
            </button>
          </form>
        {/each}
      </div>
    </section>
  </div>
{:else}
  <p class="rounded border border-stone-200 bg-white p-6">Menu not found.</p>
{/if}
