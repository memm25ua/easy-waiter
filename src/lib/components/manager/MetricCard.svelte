<script lang="ts">
  let { label, value, detail = '' } = $props<{ label: string; value: string | number; detail?: string }>();
</script>

<article class="rounded border border-stone-200 bg-white p-4">
  <p class="text-sm text-stone-500">{label}</p>
  <p class="mt-2 text-3xl font-semibold">{value}</p>
  {#if detail}<p class="mt-2 text-sm text-stone-600">{detail}</p>{/if}
</article>
