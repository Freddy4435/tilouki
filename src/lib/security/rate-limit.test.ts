import { afterEach, describe, expect, it } from "vitest";

import { checkRateLimit, resetRateLimitStore } from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it("autorise jusqu'à la limite", () => {
    const config = { key: "test", limit: 3, windowSec: 60 };

    expect(checkRateLimit(config).allowed).toBe(true);
    expect(checkRateLimit(config).allowed).toBe(true);
    expect(checkRateLimit(config).allowed).toBe(true);
    expect(checkRateLimit(config).allowed).toBe(false);
  });
});
