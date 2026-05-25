<script lang="ts">
  let { message = '', tone = 'info' } = $props<{ message?: string; tone?: 'info' | 'success' | 'error' }>();
  const classes = {
    info: 'ew-alert-info',
    success: 'ew-alert-success',
    error: 'ew-alert-error'
  };
  const toneClass = $derived(classes[(tone ?? 'info') as keyof typeof classes]);
</script>

{#if message}
  <p class={`px-3 py-2 text-sm ${toneClass}`}>{message}</p>
{/if}
