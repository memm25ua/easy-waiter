<script lang="ts">
  let { defaultItem = '', defaultOption = '', defaultValue = '', d } = $props<{
    defaultItem?: string;
    defaultOption?: string;
    defaultValue?: string;
    d: Record<string, string>;
  }>();
</script>

<form method="post" action="?/ai" class="ew-dark-panel p-4">
  <h3 class="font-semibold">{d['ai.title']}</h3>
  <textarea
    class="ew-input mt-3 min-h-20 w-full bg-[var(--ew-surface-dark-elevated)] text-[var(--ew-on-dark)] placeholder:text-[var(--ew-on-dark-soft)]"
    name="message"
    placeholder={d['ai.placeholder']}>{d['ai.defaultMessage']}</textarea
  >
  <input type="hidden" name="itemId" value={defaultItem} />
  <input type="hidden" name="optionId" value={defaultOption} />
  <input type="hidden" name="optionValueId" value={defaultValue} />
  <input type="hidden" name="quantity" value="1" />
  <div class="mt-3 grid gap-2 sm:grid-cols-2">
    <button class="ew-button-secondary">{d['ai.ask']}</button>
    <button name="confirm" value="true" class="ew-button-primary">
      {d['ai.confirm']}
    </button>
  </div>
</form>
