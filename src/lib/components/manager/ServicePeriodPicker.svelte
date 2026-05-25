<script lang="ts">
  let { period, d } = $props<{ period: string; d: Record<string, string> }>();
  const labels: Record<string, string> = $derived({
    today: d['common.today'],
    week: d['common.week'],
    month: d['common.month']
  });
</script>

<form class="flex flex-wrap gap-2">
  {#each ['today', 'week', 'month'] as option}
    <button
      name="period"
      value={option}
      class={period === option
        ? 'ew-button-primary'
        : 'ew-button-secondary'}
    >
      {labels[option] ?? option}
    </button>
  {/each}
</form>
