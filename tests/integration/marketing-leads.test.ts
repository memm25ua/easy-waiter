import { describe, expect, it } from "vitest";
import { validateLead } from "$lib/server/marketing-leads";

describe("marketing lead validation", () => {
  it("normalizes valid emails and rejects invalid emails", () => {
    expect(validateLead({ email: " OWNER@EXAMPLE.COM " }).email).toBe(
      "owner@example.com",
    );
    expect(() => validateLead({ email: "not-an-email" })).toThrow(
      /valid email/,
    );
  });
});
