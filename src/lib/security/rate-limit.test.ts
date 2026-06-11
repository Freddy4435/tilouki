import { afterEach, describe, expect, it } from "vitest";

import { checkRateLimit, resetRateLimitStore } from "@/lib/security/rate-limit";

describe("checkRateLimit (fallback mémoire — sans variables Upstash)", () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it("autorise jusqu'à la limite", async () => {
    const config = { key: "test", limit: 3, windowSec: 60 };

    expect((await checkRateLimit(config)).allowed).toBe(true);
    expect((await checkRateLimit(config)).allowed).toBe(true);
    expect((await checkRateLimit(config)).allowed).toBe(true);
    expect((await checkRateLimit(config)).allowed).toBe(false);
  });

  it("décrémente remaining et expose resetAt", async () => {
    const config = { key: "remaining", limit: 2, windowSec: 60 };
    const before = Date.now();

    const first = await checkRateLimit(config);
    expect(first.remaining).toBe(1);
    expect(first.resetAt).toBeGreaterThanOrEqual(before + 60_000);

    const second = await checkRateLimit(config);
    expect(second.remaining).toBe(0);

    const third = await checkRateLimit(config);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });
});
