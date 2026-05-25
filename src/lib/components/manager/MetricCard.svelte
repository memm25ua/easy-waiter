<script lang="ts">
  let { label, value, detail = '' } = $props<{ label: string; value: string | number; detail?: string }>();
</script>

<article class="ew-card p-4">
  <p class="ew-muted text-sm">{label}</p>
  <p class="mt-2 text-3xl font-semibold">{value}</p>
  {#if detail}<p class="ew-muted mt-2 text-sm">{detail}</p>{/if}
</article>
