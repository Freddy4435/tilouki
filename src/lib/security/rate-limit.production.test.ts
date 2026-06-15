import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkRateLimit,
  getRateLimitBackend,
  isE2eMemoryRateLimitAllowed,
  isProductionRateLimitStrict,
  isUpstashRateLimitConfigured,
  resetRateLimitStore,
} from "@/lib/security/rate-limit";

describe("rate-limit — production strict", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetRateLimitStore();
  });

  it("signale un backend indisponible sans Upstash", () => {
    expect(isProductionRateLimitStrict()).toBe(true);
    expect(isUpstashRateLimitConfigured()).toBe(false);
    expect(getRateLimitBackend()).toBe("unavailable");
  });

  it("refuse les requêtes sans Upstash en production", async () => {
    const result = await checkRateLimit({
      key: "prod:blocked",
      limit: 10,
      windowSec: 60,
    });

    expect(result.allowed).toBe(false);
    expect(result.unavailable).toBe(true);
    expect(result.remaining).toBe(0);
  });
});

describe("rate-limit — e2e production local explicite", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("E2E_ALLOW_MEMORY_RATE_LIMIT", "1");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetRateLimitStore();
  });

  it("autorise le fallback mémoire quand E2E_ALLOW_MEMORY_RATE_LIMIT=1", async () => {
    expect(isE2eMemoryRateLimitAllowed()).toBe(true);
    expect(isProductionRateLimitStrict()).toBe(false);
    expect(getRateLimitBackend()).toBe("memory");

    const result = await checkRateLimit({
      key: "e2e:ok",
      limit: 5,
      windowSec: 60,
    });

    expect(result.allowed).toBe(true);
    expect(result.unavailable).toBeUndefined();
    expect(result.remaining).toBe(4);
  });
});

describe("rate-limit — développement sans Upstash", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetRateLimitStore();
  });

  it("utilise le fallback mémoire en dev", async () => {
    expect(getRateLimitBackend()).toBe("memory");

    const result = await checkRateLimit({ key: "dev:ok", limit: 2, windowSec: 60 });
    expect(result.allowed).toBe(true);
    expect(result.unavailable).toBeUndefined();
    expect(result.remaining).toBe(1);
  });
});
