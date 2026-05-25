<script lang="ts">
  let { d } = $props<{ d: Record<string, string> }>();
</script>

<section>
  <div class="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
    <div class="space-y-6">
      <p class="ew-eyebrow">{d['landing.eyebrow']}</p>
      <h1 class="ew-display text-5xl text-[var(--ew-ink)] sm:text-6xl">
        {d['landing.title']}
      </h1>
      <p class="ew-muted max-w-2xl text-lg leading-8">
        {d['landing.description']}
      </p>
      <div class="flex flex-wrap gap-3">
        <a class="ew-button-primary" href="/auth/sign-up">{d['landing.primary']}</a>
        <a class="ew-button-secondary" href="#contact">{d['landing.secondary']}</a>
      </div>
    </div>
    <div class="ew-dark-panel grid content-start gap-3 p-5">
      <p class="text-sm font-medium text-[var(--ew-on-dark-soft)]">{d['landing.workflow']}</p>
      <div class="rounded-lg bg-[var(--ew-surface-dark-elevated)] p-4">
        <p class="font-medium">{d['landing.workflow.order']}</p>
        <p class="mt-1 text-sm text-[var(--ew-on-dark-soft)]">{d['landing.workflow.orderDetail']}</p>
      </div>
      <div class="rounded-lg bg-[var(--ew-surface-dark-elevated)] p-4">
        <p class="font-medium">{d['landing.workflow.context']}</p>
        <p class="mt-1 text-sm text-[var(--ew-on-dark-soft)]">{d['landing.workflow.contextDetail']}</p>
      </div>
    </div>
  </div>
</section>
