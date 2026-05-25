<script lang="ts">
  import MetricCard from '$lib/components/manager/MetricCard.svelte';
  import ServicePeriodPicker from '$lib/components/manager/ServicePeriodPicker.svelte';
  let { data } = $props();
  const d = $derived(data.dictionary);
</script>

<div class="space-y-6">
  <div>
    <p class="ew-eyebrow">{d['analytics.eyebrow']}</p>
    <h2 class="ew-display mt-1 text-4xl">{d['analytics.title']}</h2>
  </div>
  <ServicePeriodPicker period={data.period} {d} />
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <MetricCard label={d['analytics.totalOrders']} value={data.summary.totalOrders} />
    <MetricCard label={d['analytics.aiOrders']} value={data.summary.aiAssistedOrders} />
    <MetricCard label={d['analytics.manualOrders']} value={data.summary.manualOrders} />
    <MetricCard label={d['analytics.interventions']} value={data.summary.staffInterventions} />
    <MetricCard
      label={d['analytics.averageSubmission']}
      value={`${Math.round(data.summary.averageSubmissionSeconds / 60)} min`}
      detail={d['analytics.averageDetail']}
    />
  </div>
</div>
