import { describe, expect, it } from "vitest";
import { aggregateOperationalSummary } from "$lib/server/analytics";
import { demoOrders, demoSession } from "$lib/server/demo-data";

describe("operational summary", () => {
  it("counts manual, AI, and intervention metrics", () => {
    const summary = aggregateOperationalSummary(
      demoOrders,
      new Map([[demoSession.id, demoSession.openedAt]]),
    );
    expect(summary.totalOrders).toBe(2);
    expect(summary.manualOrders).toBe(1);
    expect(summary.aiAssistedOrders).toBe(1);
    expect(summary.averageSubmissionSeconds).toBeGreaterThan(0);
  });
});
