import { describe, expect, it } from "vitest";
import { completeRestaurantOnboarding } from "$lib/server/onboarding";

describe("auth and onboarding contract", () => {
  it("exposes an onboarding service for authenticated account setup", () => {
    expect(typeof completeRestaurantOnboarding).toBe("function");
  });
});
