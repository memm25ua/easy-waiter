<script lang="ts">
  import MetricCard from '$lib/components/manager/MetricCard.svelte';
  import ServicePeriodPicker from '$lib/components/manager/ServicePeriodPicker.svelte';
  let { data } = $props();
</script>

<div class="space-y-6">
  <div>
    <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Analytics</p>
    <h2 class="mt-1 text-3xl font-semibold tracking-tight">Workload summary</h2>
  </div>
  <ServicePeriodPicker period={data.period} />
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <MetricCard label="Total orders" value={data.summary.totalOrders} />
    <MetricCard label="AI-assisted orders" value={data.summary.aiAssistedOrders} />
    <MetricCard label="Manual orders" value={data.summary.manualOrders} />
    <MetricCard label="Staff interventions" value={data.summary.staffInterventions} />
    <MetricCard
      label="Average submission time"
      value={`${Math.round(data.summary.averageSubmissionSeconds / 60)} min`}
      detail="From table open to order submission"
    />
  </div>
</div>
