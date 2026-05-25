<script lang="ts">
  import LandingHero from '$lib/components/landing/LandingHero.svelte';
  import LeadForm from '$lib/components/landing/LeadForm.svelte';
  import WorkflowSections from '$lib/components/landing/WorkflowSections.svelte';

  let { data, form } = $props();
  const leadForm = $derived(form ?? undefined);
  const d = $derived(data.dictionary);
</script>

<svelte:head>
  <title>Easy Waiter | Dine-in ordering for restaurants</title>
  <meta
    name="description"
    content="Easy Waiter helps restaurants run dine-in table ordering, staff order control, menu publishing, and AI menu assistance."
  />
  {#if data.metadata.noIndex}
    <meta name="robots" content="noindex,nofollow" />
  {/if}
  <link rel="canonical" href={data.metadata.environment === 'production' ? '/': '/'} />
  <link rel="alternate" hreflang="en" href="/?lang=en" />
  <link rel="alternate" hreflang="es" href="/?lang=es" />
</svelte:head>

<main>
  <LandingHero {d} />
  <WorkflowSections {d} />
  <section id="contact" class="mx-auto max-w-6xl px-4 py-10">
    <div class="ew-panel grid gap-5 p-6">
      <div>
        <h2 class="ew-display text-3xl">{d['landing.contact.title']}</h2>
        <p class="ew-muted mt-2">{d['landing.contact.body']}</p>
      </div>
      <LeadForm form={leadForm} {d} />
    </div>
  </section>
</main>
