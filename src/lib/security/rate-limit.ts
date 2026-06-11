import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
  /** Identifiant unique (ex. IP + route) */
  key: string;
  /** Nombre max de requêtes */
  limit: number;
  /** Fenêtre en secondes */
  windowSec: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// ---------------------------------------------------------------------------
// Fallback mémoire — dev local sans Redis. Inopérant en serverless multi-
// instance (chaque instance a sa propre Map) : Upstash prend le relais en prod.
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function checkRateLimitMemory(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSec * 1000;
  const entry = store.get(config.key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(config.key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

// ---------------------------------------------------------------------------
// Upstash — sliding window partagé entre toutes les instances serverless.
// ---------------------------------------------------------------------------

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

let redis: Redis | null = null;
/** Une instance Ratelimit par couple (limit, fenêtre) — configuration immuable. */
const limiters = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowSec: number): Ratelimit {
  const cacheKey = `${limit}:${windowSec}`;
  let limiter = limiters.get(cacheKey);

  if (!limiter) {
    redis ??= new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "tilouki:rl",
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }

  return limiter;
}

/**
 * Façade : Upstash Redis si UPSTASH_REDIS_REST_URL/TOKEN sont présents,
 * sinon Map mémoire (dev local). En cas d'erreur Redis, bascule sur la
 * Map mémoire plutôt que de bloquer la requête.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  if (!isUpstashConfigured()) {
    return checkRateLimitMemory(config);
  }

  try {
    const { success, remaining, reset } = await getUpstashLimiter(
      config.limit,
      config.windowSec,
    ).limit(config.key);

    return { allowed: success, remaining, resetAt: reset };
  } catch {
    return checkRateLimitMemory(config);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitKey(request: Request, route: string): string {
  return `${getClientIp(request)}:${route}`;
}

/** Réinitialise le store mémoire et les clients Upstash (tests uniquement). */
export function resetRateLimitStore(): void {
  store.clear();
  limiters.clear();
  redis = null;
}
