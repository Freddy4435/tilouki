interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

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

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
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

/** Réinitialise le store (tests uniquement). */
export function resetRateLimitStore(): void {
  store.clear();
}
