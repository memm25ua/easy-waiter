<script lang="ts">
  import { t } from '$lib/i18n';

  let {
    title = t('en', 'access.title'),
    message = t('en', 'access.message'),
    actionHref = '/auth/sign-in',
    actionLabel = t('en', 'access.action')
  } = $props<{
    title?: string;
    message?: string;
    actionHref?: string;
    actionLabel?: string;
  }>();
</script>

<section class="mx-auto max-w-xl px-4 py-16">
  <div class="ew-panel p-6">
    <h1 class="ew-display text-3xl">{title}</h1>
    <p class="ew-muted mt-3">{message}</p>
    <a class="ew-button-primary mt-5" href={actionHref}>
      {actionLabel}
    </a>
  </div>
</section>
