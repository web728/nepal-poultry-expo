import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.BROCHURE_LINK_SECRET = "test-secret-for-brochure-links";
});

describe("signed brochure links", async () => {
  const { createBrochureToken, verifyBrochureToken } = await import("@/lib/brochure/brochure");
  const id = "NPE-BRO-261121-ABCDEF";

  it("round-trips a valid token", () => {
    const token = createBrochureToken(id)!;
    expect(verifyBrochureToken(token)).toEqual({ submissionId: id });
  });

  it("rejects tampered tokens", () => {
    const token = createBrochureToken(id)!;
    const [, exp, sig] = token.split(".");
    expect(verifyBrochureToken(`NPE-BRO-261121-ZZZZZZ.${exp}.${sig}`)).toBeNull();
    expect(verifyBrochureToken(`${id}.${Number(exp) + 999}.${sig}`)).toBeNull();
    expect(verifyBrochureToken("garbage")).toBeNull();
  });

  it("rejects expired tokens", () => {
    const token = createBrochureToken(id, Date.now() - 8 * 24 * 3600 * 1000)!;
    expect(verifyBrochureToken(token)).toBeNull();
  });
});
