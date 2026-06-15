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
  /**
   * true si le rate limiting est indisponible en production (Upstash absent ou en échec).
   * Les routes sensibles doivent répondre 503, pas 429.
   */
  unavailable?: boolean;
}

export type RateLimitBackend = "upstash" | "memory" | "unavailable";

// ---------------------------------------------------------------------------
// Fallback mémoire — dev local sans Redis. Inopérant en serverless multi-
// instance (chaque instance a sa propre Map) : interdit en production.
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
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// ---------------------------------------------------------------------------
// Upstash — sliding window partagé entre toutes les instances serverless.
// ---------------------------------------------------------------------------

export function isUpstashRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

/**
 * Autorise le fallback mémoire en serveur production local (Playwright uniquement).
 * Ne jamais définir sur Vercel — `verify:deploy:prod` exige toujours Upstash.
 */
export function isE2eMemoryRateLimitAllowed(): boolean {
  return process.env.E2E_ALLOW_MEMORY_RATE_LIMIT === "1";
}

/** En production, le fallback mémoire est interdit (serverless Vercel). */
export function isProductionRateLimitStrict(): boolean {
  if (isE2eMemoryRateLimitAllowed()) return false;
  return process.env.NODE_ENV === "production";
}

export function getRateLimitBackend(): RateLimitBackend {
  if (isProductionRateLimitStrict() && !isUpstashRateLimitConfigured()) {
    return "unavailable";
  }
  if (isUpstashRateLimitConfigured()) return "upstash";
  return "memory";
}

function unavailableRateLimitResult(): RateLimitResult {
  return {
    allowed: false,
    remaining: 0,
    resetAt: Date.now() + 60_000,
    unavailable: true,
  };
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
 * Façade : Upstash Redis en production (obligatoire hors e2e local explicite).
 * En développement ou e2e local (`E2E_ALLOW_MEMORY_RATE_LIMIT=1`) : Map mémoire si Upstash absent.
 */
export async function checkRateLimit(
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  if (!isUpstashRateLimitConfigured()) {
    if (isProductionRateLimitStrict()) {
      return unavailableRateLimitResult();
    }
    return checkRateLimitMemory(config);
  }

  try {
    const { success, remaining, reset } = await getUpstashLimiter(
      config.limit,
      config.windowSec,
    ).limit(config.key);

    return { allowed: success, remaining, resetAt: reset };
  } catch {
    if (isProductionRateLimitStrict()) {
      return unavailableRateLimitResult();
    }
    return checkRateLimitMemory(config);
  }
}

/** Message utilisateur selon le résultat du rate limit. */
export function rateLimitDeniedMessage(result: RateLimitResult): string {
  if (result.unavailable) {
    return "Service temporairement indisponible. Réessayez plus tard.";
  }
  return "Trop de requêtes. Réessayez dans quelques instants.";
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
