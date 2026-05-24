<script lang="ts">
  let { period } = $props<{ period: string }>();
</script>

<form class="flex flex-wrap gap-2">
  {#each ['today', 'week', 'month'] as option}
    <button
      name="period"
      value={option}
      class={period === option
        ? 'rounded bg-stone-950 px-3 py-2 text-sm font-medium text-white'
        : 'rounded border border-stone-300 px-3 py-2 text-sm font-medium'}
    >
      {option}
    </button>
  {/each}
</form>
