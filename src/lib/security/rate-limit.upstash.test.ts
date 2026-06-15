import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  limit: vi.fn(),
  slidingWindow: vi.fn((limit: number, window: string) => ({ limit, window })),
  ratelimitConstructor: vi.fn(),
  redisConstructor: vi.fn(),
}));

vi.mock("@upstash/ratelimit", () => {
  class RatelimitMock {
    static slidingWindow = mocks.slidingWindow;
    constructor(config: unknown) {
      mocks.ratelimitConstructor(config);
    }
    limit = mocks.limit;
  }
  return { Ratelimit: RatelimitMock };
});

vi.mock("@upstash/redis", () => {
  class RedisMock {
    constructor(config: unknown) {
      mocks.redisConstructor(config);
    }
  }
  return { Redis: RedisMock };
});

import { checkRateLimit, resetRateLimitStore } from "@/lib/security/rate-limit";

describe("checkRateLimit (façade Upstash)", () => {
  beforeEach(() => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://upstash.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    resetRateLimitStore();
  });

  it("interroge Upstash en sliding window et mappe le résultat", async () => {
    const reset = Date.now() + 60_000;
    mocks.limit.mockResolvedValue({ success: true, limit: 10, remaining: 7, reset });

    const result = await checkRateLimit({
      key: "1.2.3.4:checkout",
      limit: 10,
      windowSec: 60,
    });

    expect(mocks.redisConstructor).toHaveBeenCalledWith({
      url: "https://upstash.test",
      token: "token-test",
    });
    expect(mocks.slidingWindow).toHaveBeenCalledWith(10, "60 s");
    expect(mocks.limit).toHaveBeenCalledWith("1.2.3.4:checkout");
    expect(result).toEqual({ allowed: true, remaining: 7, resetAt: reset });
  });

  it("bloque quand Upstash refuse la requête", async () => {
    const reset = Date.now() + 30_000;
    mocks.limit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset });

    const result = await checkRateLimit({ key: "ip:route", limit: 10, windowSec: 60 });

    expect(result).toEqual({ allowed: false, remaining: 0, resetAt: reset });
  });

  it("réutilise la même instance Ratelimit pour un couple (limite, fenêtre)", async () => {
    mocks.limit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now(),
    });

    await checkRateLimit({ key: "a", limit: 10, windowSec: 60 });
    await checkRateLimit({ key: "b", limit: 10, windowSec: 60 });
    await checkRateLimit({ key: "c", limit: 20, windowSec: 60 });

    expect(mocks.ratelimitConstructor).toHaveBeenCalledTimes(2);
  });

  it("bascule sur la Map mémoire si Upstash échoue (dev uniquement)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mocks.limit.mockRejectedValue(new Error("Redis injoignable"));

    const result = await checkRateLimit({ key: "fallback", limit: 3, windowSec: 60 });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.unavailable).toBeUndefined();
  });

  it("refuse la requête si Upstash échoue en production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.limit.mockRejectedValue(new Error("Redis injoignable"));

    const result = await checkRateLimit({ key: "prod-fail", limit: 3, windowSec: 60 });

    expect(result.allowed).toBe(false);
    expect(result.unavailable).toBe(true);
  });

  it("utilise la Map mémoire sans variables Upstash en dev", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const result = await checkRateLimit({ key: "memoire", limit: 2, windowSec: 60 });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
    expect(mocks.limit).not.toHaveBeenCalled();
    expect(mocks.redisConstructor).not.toHaveBeenCalled();
  });
});
