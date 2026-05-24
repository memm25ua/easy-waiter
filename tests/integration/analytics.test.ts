import { describe, expect, it } from "vitest";
import { aggregateOperationalSummary } from "$lib/server/analytics";
import { demoOrders } from "$lib/server/demo-data";

describe("analytics loader contract", () => {
  it("supports selectable service period summaries", () => {
    expect(aggregateOperationalSummary(demoOrders).totalOrders).toBe(
      demoOrders.length,
    );
  });
});
