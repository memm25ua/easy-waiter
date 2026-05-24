import { describe, expect, it } from "vitest";
import { runAiWaiter } from "$lib/server/ai";
import { demoSession } from "$lib/server/demo-data";

describe("AI waiter action confirmation", () => {
  it("requires confirmation before submitting", async () => {
    const result = await runAiWaiter({
      session: demoSession,
      message: "recommend rice",
      currentCart: [],
    });
    expect(result.requiresConfirmation).toBe(true);
    expect(result.submittedOrderId).toBeNull();
  });

  it("submits only a matching confirmed proposal", async () => {
    const proposal = [
      {
        menuItemId: "item-rice",
        quantity: 1,
        selections: [{ optionId: "option-side", valueIds: ["side-salad"] }],
      },
    ];
    const result = await runAiWaiter({
      session: demoSession,
      message: "recommend rice",
      currentCart: [],
      customerConfirmedAction: proposal,
    });
    expect(result.submittedOrderId).toContain("order-");
  });
});
