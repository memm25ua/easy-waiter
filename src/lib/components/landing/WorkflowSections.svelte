<script lang="ts">
  let { d } = $props<{ d: Record<string, string> }>();
</script>

<section class="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
  <article class="ew-card p-6">
    <h2 class="text-lg font-semibold">{d['landing.publish.title']}</h2>
    <p class="ew-muted mt-2 text-sm">{d['landing.publish.body']}</p>
  </article>
  <article class="ew-card p-6">
    <h2 class="text-lg font-semibold">{d['landing.serve.title']}</h2>
    <p class="ew-muted mt-2 text-sm">{d['landing.serve.body']}</p>
  </article>
  <article class="ew-card p-6">
    <h2 class="text-lg font-semibold">{d['landing.ai.title']}</h2>
    <p class="ew-muted mt-2 text-sm">{d['landing.ai.body']}</p>
  </article>
</section>
