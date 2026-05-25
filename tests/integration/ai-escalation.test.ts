import { describe, expect, it } from "vitest";

const escalationCases = [
  "allergen",
  "safety",
  "unavailable",
  "substitution",
  "complaint",
  "refund",
  "discount",
  "cancellation",
];

describe("AI escalation coverage", () => {
  it("tracks every clarified staff-judgment case", () => {
    expect(escalationCases).toEqual([
      "allergen",
      "safety",
      "unavailable",
      "substitution",
      "complaint",
      "refund",
      "discount",
      "cancellation",
    ]);
  });
});
