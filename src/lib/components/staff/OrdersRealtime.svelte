<script lang="ts">
  let { locationId, d } = $props<{ locationId?: string; d: Record<string, string> }>();
</script>

<p class="ew-alert-success px-3 py-2 text-sm">
  {d['orders.live']}{locationId ? ` ${locationId}` : ''}.
</p>
