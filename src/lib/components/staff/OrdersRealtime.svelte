<script lang="ts">
  let connected = true;
</script>

<div class="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
  {connected ? 'Live order updates connected.' : 'Live updates disconnected. Refresh to sync orders.'}
</div>
