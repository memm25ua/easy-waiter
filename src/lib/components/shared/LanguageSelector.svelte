<script lang="ts">
  import type { SupportedLocale } from '$lib/types';

  let { locale = 'en', label = 'Language', english = 'English', spanish = 'Spanish' } = $props<{
    locale?: SupportedLocale;
    label?: string;
    english?: string;
    spanish?: string;
  }>();
</script>

<form method="get" class="flex items-center gap-2 text-sm">
  <label class="sr-only" for="locale-select">{label}</label>
  <select
    id="locale-select"
    class="ew-input min-h-9 py-1 text-sm"
    name="lang"
    aria-label={label}
    onchange={(event) => event.currentTarget.form?.requestSubmit()}
  >
    <option value="en" selected={locale === 'en'}>{english}</option>
    <option value="es" selected={locale === 'es'}>{spanish}</option>
  </select>
</form>
