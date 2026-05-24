<script lang="ts">
  let { data, form } = $props();
</script>

<div class="space-y-6">
  <div>
    <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Menu import</p>
    <h2 class="mt-1 text-3xl font-semibold tracking-tight">Menus</h2>
  </div>
  <form
    method="post"
    action="?/upload"
    enctype="multipart/form-data"
    class="rounded border border-stone-200 bg-white p-4"
  >
    <label class="block text-sm font-medium" for="menuFile">Upload PDF or scan</label>
    <div class="mt-3 flex flex-wrap gap-3">
      <input id="menuFile" name="menuFile" type="file" accept="application/pdf,image/*" class="rounded border p-2" />
      <button class="rounded bg-stone-950 px-4 py-2 font-medium text-white">Create draft</button>
    </div>
    {#if form?.message}<p class="mt-3 text-sm text-red-700">{form.message}</p>{/if}
  </form>
  <section class="grid gap-3">
    {#each data.menus as menu}
      <article class="rounded border border-stone-200 bg-white p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="font-semibold">{menu.title}</h3>
            <p class="text-sm capitalize text-stone-600">{menu.status}</p>
          </div>
          <a class="rounded border border-stone-300 px-3 py-2 text-sm font-medium" href={`/manager/menus/${menu.id}`}
            >Review</a
          >
        </div>
      </article>
    {:else}
      <div class="rounded border border-stone-200 bg-white p-6 text-stone-600">
        No menus yet. Upload a file to create a review draft.
      </div>
    {/each}
  </section>
</div>
