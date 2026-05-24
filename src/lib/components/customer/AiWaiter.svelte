<script lang="ts">
  let { defaultItem = 'item-rice' } = $props<{ defaultItem?: string }>();
</script>

<form method="post" action="?/ai" class="rounded border border-blue-200 bg-blue-50 p-4">
  <h3 class="font-semibold text-blue-950">AI waiter</h3>
  <textarea
    class="mt-3 min-h-20 w-full rounded border border-blue-200 px-3 py-2"
    name="message"
    placeholder="Ask for a recommendation">Recommend a main dish</textarea
  >
  <input type="hidden" name="itemId" value={defaultItem} />
  <input type="hidden" name="side" value="side-salad" />
  <input type="hidden" name="quantity" value="1" />
  <div class="mt-3 grid gap-2 sm:grid-cols-2">
    <button class="rounded border border-blue-300 px-3 py-2 font-medium text-blue-950">Ask</button>
    <button name="confirm" value="true" class="rounded bg-blue-700 px-3 py-2 font-medium text-white">
      Confirm AI order
    </button>
  </div>
</form>
