<script lang="ts">
  import MenuSectionEditor from "$lib/components/manager/MenuSectionEditor.svelte";
  let { data, form } = $props();
  const d = $derived(data.dictionary);
  const issues = $derived(
    form && "issues" in form && Array.isArray(form.issues) ? form.issues : [],
  );
</script>

{#if data.menu}
  <div class="space-y-6">
    <div>
      <p class="ew-eyebrow">{d["menus.reviewEyebrow"]}</p>
      <h2 class="ew-display mt-1 text-4xl">{data.menu.title}</h2>
      <p class="ew-muted mt-2 text-sm">
        {d["menus.version"]}
        {data.menu.currentVersion ?? 1}
      </p>
    </div>
    {#if form?.message}<p class="ew-alert-info p-3 text-sm">
        {form.message}
      </p>{/if}
    {#if issues.length > 0}
      <div class="ew-alert-error p-3 text-sm">
        <p class="font-semibold">{d["menus.publishBlocked"]}</p>
        <ul class="mt-2 list-disc pl-5">
          {#each issues as issue}
            <li>{issue}</li>
          {/each}
        </ul>
      </div>
    {/if}
    <form method="post" action="?/save" class="space-y-4">
      <input
        type="hidden"
        name="lastSeenVersion"
        value={data.menu.currentVersion ?? 1}
      />
      <label class="grid gap-1 text-sm">
        <span class="font-medium">{d["menus.menuTitle"]}</span>
        <input class="ew-input" name="title" value={data.menu.title} />
      </label>
      {#each data.menu.sections as section}
        <MenuSectionEditor {section} {d} />
      {/each}
      <div class="flex flex-wrap gap-3">
        <button class="ew-button-primary">{d["menus.save"]}</button>
        <button formaction="?/publish" class="ew-button-secondary">
          {d["menus.publish"]}
        </button>
        <span class="ew-alert-info px-3 py-2 text-sm">{d["menus.preview"]}</span
        >
      </div>
    </form>
    <section class="ew-panel p-4">
      <h3 class="font-semibold">{d["menus.manualEdit"]}</h3>
      <form
        method="post"
        action="?/addSection"
        class="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
      >
        <label class="grid gap-1 text-sm">
          <span class="font-medium">{d["menus.sectionName"]}</span>
          <input class="ew-input" name="sectionName" />
        </label>
        <label class="grid gap-1 text-sm">
          <span class="font-medium">{d["menus.sectionDescription"]}</span>
          <input class="ew-input" name="sectionDescription" />
        </label>
        <button class="ew-button-secondary self-end"
          >{d["menus.addSection"]}</button
        >
      </form>
      {#if data.menu.sections.length > 0}
        <form
          method="post"
          action="?/addItem"
          class="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_8rem_auto]"
        >
          <label class="grid gap-1 text-sm">
            <span class="font-medium">{d["menus.sectionName"]}</span>
            <select class="ew-input" name="sectionId">
              {#each data.menu.sections as section}
                <option value={section.id}>{section.name}</option>
              {/each}
            </select>
          </label>
          <label class="grid gap-1 text-sm">
            <span class="font-medium">{d["menus.itemName"]}</span>
            <input class="ew-input" name="itemName" />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="font-medium">{d["menus.price"]}</span>
            <input
              class="ew-input"
              name="itemPrice"
              type="number"
              min="0"
              step="0.01"
            />
          </label>
          <button class="ew-button-secondary self-end"
            >{d["menus.addItem"]}</button
          >
        </form>
      {/if}
    </section>
    {#if data.importWarnings.length > 0}
      <section class="ew-panel p-4">
        <h3 class="font-semibold">{d["menus.ocrSummary"]}</h3>
        <div class="mt-3 grid gap-2">
          {#each data.importWarnings as warning}
            <form
              method="post"
              action="?/resolveWarning"
              class="rounded-lg border border-[var(--ew-hairline)] p-3"
            >
              <input type="hidden" name="warningId" value={warning.id} />
              <p class="text-sm font-medium">
                {warning.severity === "critical"
                  ? d["menus.criticalWarning"]
                  : d["menus.nonCriticalWarning"]}
              </p>
              <p class="ew-muted mt-1 text-sm">{warning.message}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  name="action"
                  value="resolved"
                  class="ew-button-secondary"
                >
                  {d["menus.resolveWarning"]}
                </button>
                {#if warning.severity !== "critical"}
                  <button
                    name="action"
                    value="accepted"
                    class="ew-button-secondary"
                  >
                    {d["menus.acceptWarning"]}
                  </button>
                {/if}
              </div>
            </form>
          {/each}
        </div>
      </section>
    {/if}
    <section class="ew-panel p-4">
      <h3 class="font-semibold">{d["menus.availability"]}</h3>
      <div class="mt-3 grid gap-2">
        {#each data.menu.sections.flatMap((section) => section.items) as item}
          <form
            method="post"
            action="?/availability"
            class="flex items-center justify-between gap-3 rounded-lg border border-[var(--ew-hairline)] p-3"
          >
            <input type="hidden" name="itemId" value={item.id} />
            <span>{item.name}</span>
            <button
              name="isAvailable"
              value={item.isAvailable ? "false" : "true"}
              class="ew-button-secondary"
            >
              {item.isAvailable
                ? d["menus.markUnavailable"]
                : d["menus.markAvailable"]}
            </button>
          </form>
          <div
            class="flex flex-wrap gap-2 rounded-lg border border-[var(--ew-hairline)] p-3"
          >
            <form method="post" action="?/duplicateItem">
              <input type="hidden" name="itemId" value={item.id} />
              <button class="ew-button-secondary">{d["menus.duplicate"]}</button
              >
            </form>
            <form method="post" action="?/reorderItem">
              <input type="hidden" name="itemId" value={item.id} />
              <button name="direction" value="up" class="ew-button-secondary">
                {d["menus.moveUp"]}
              </button>
            </form>
            <form method="post" action="?/reorderItem">
              <input type="hidden" name="itemId" value={item.id} />
              <button name="direction" value="down" class="ew-button-secondary">
                {d["menus.moveDown"]}
              </button>
            </form>
            <form method="post" action="?/archiveItem">
              <input type="hidden" name="itemId" value={item.id} />
              <button class="ew-button-secondary">{d["menus.archive"]}</button>
            </form>
          </div>
          <div
            class="grid gap-3 rounded-lg border border-[var(--ew-hairline)] p-3"
          >
            <form
              method="post"
              action="?/addOptionGroup"
              class="grid gap-3 md:grid-cols-[1fr_auto_auto]"
            >
              <input type="hidden" name="itemId" value={item.id} />
              <label class="grid gap-1 text-sm">
                <span class="font-medium">{d["menus.optionName"]}</span>
                <input class="ew-input" name="optionName" />
              </label>
              <label class="flex items-end gap-2 text-sm">
                <input name="isRequired" value="true" type="checkbox" />
                <span>{d["menus.required"]}</span>
              </label>
              <button class="ew-button-secondary self-end"
                >{d["menus.addOption"]}</button
              >
            </form>
            {#each item.options as option}
              <div
                class="grid gap-2 rounded-md bg-[var(--ew-surface-soft)] p-3"
              >
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <span class="font-medium">{option.name}</span>
                  <form method="post" action="?/archiveOptionGroup">
                    <input type="hidden" name="optionId" value={option.id} />
                    <button class="ew-button-secondary"
                      >{d["menus.archive"]}</button
                    >
                  </form>
                  <form method="post" action="?/reorderOptionGroup">
                    <input type="hidden" name="optionId" value={option.id} />
                    <button
                      name="direction"
                      value="up"
                      class="ew-button-secondary">{d["menus.moveUp"]}</button
                    >
                  </form>
                  <form method="post" action="?/reorderOptionGroup">
                    <input type="hidden" name="optionId" value={option.id} />
                    <button
                      name="direction"
                      value="down"
                      class="ew-button-secondary">{d["menus.moveDown"]}</button
                    >
                  </form>
                </div>
                <form
                  method="post"
                  action="?/addOptionValue"
                  class="grid gap-3 md:grid-cols-[1fr_8rem_auto]"
                >
                  <input type="hidden" name="optionId" value={option.id} />
                  <label class="grid gap-1 text-sm">
                    <span class="font-medium">{d["menus.choiceName"]}</span>
                    <input class="ew-input" name="valueName" />
                  </label>
                  <label class="grid gap-1 text-sm">
                    <span class="font-medium">{d["menus.priceDelta"]}</span>
                    <input
                      class="ew-input"
                      name="priceDelta"
                      type="number"
                      step="0.01"
                    />
                  </label>
                  <button class="ew-button-secondary self-end"
                    >{d["menus.addChoice"]}</button
                  >
                </form>
                <div class="flex flex-wrap gap-2">
                  {#each option.values as value}
                    <form
                      method="post"
                      action="?/archiveOptionValue"
                      class="flex items-center gap-2 rounded-md border border-[var(--ew-hairline)] px-3 py-2"
                    >
                      <input type="hidden" name="valueId" value={value.id} />
                      <span>{value.name}</span>
                      <button class="ew-button-secondary"
                        >{d["menus.archive"]}</button
                      >
                    </form>
                    <form
                      method="post"
                      action="?/reorderOptionValue"
                      class="flex items-center gap-2"
                    >
                      <input type="hidden" name="valueId" value={value.id} />
                      <button
                        name="direction"
                        value="up"
                        class="ew-button-secondary">{d["menus.moveUp"]}</button
                      >
                      <button
                        name="direction"
                        value="down"
                        class="ew-button-secondary"
                        >{d["menus.moveDown"]}</button
                      >
                    </form>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </section>
  </div>
{:else}
  <p class="ew-panel p-6">{d["menus.notFound"]}</p>
{/if}
