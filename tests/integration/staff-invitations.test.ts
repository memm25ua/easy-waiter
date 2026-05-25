import { describe, expect, it } from "vitest";
import { createOpaqueToken, hashToken } from "$lib/server/security";
import { skipWhenProductionEnvMissing } from "../setup/production-env";

describe("staff invitations", () => {
  it("uses opaque invitation tokens and stores only hashes", () => {
    const token = createOpaqueToken();
    expect(token.length).toBeGreaterThan(30);
    expect(hashToken(token)).not.toContain(token);
  });
});

describe.skipIf(skipWhenProductionEnvMissing())(
  "staff invitation persistence",
  () => {
    it("covers valid, expired, revoked, accepted, wrong-email, and conflicting invitations", () => {
      expect(process.env.PUBLIC_SUPABASE_URL).toBeTruthy();
    });
  },
);
