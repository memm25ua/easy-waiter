import { describe, expect, it } from "vitest";
import {
  createOpaqueToken,
  hashToken,
  tokenMatches,
} from "$lib/server/security";

describe("token security helpers", () => {
  it("creates unguessable tokens and compares only hashes", () => {
    const token = createOpaqueToken();
    const other = createOpaqueToken();
    const hash = hashToken(token);

    expect(token).not.toEqual(other);
    expect(hash).not.toContain(token);
    expect(tokenMatches(token, hash)).toBe(true);
    expect(tokenMatches(other, hash)).toBe(false);
    expect(tokenMatches(token, null)).toBe(false);
  });
});
