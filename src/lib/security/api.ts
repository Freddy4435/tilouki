import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

import { checkRateLimit, rateLimitKey, type RateLimitConfig } from "@/lib/security/rate-limit";

export interface ApiGuardOptions {
  rateLimit?: Omit<RateLimitConfig, "key"> & { route: string };
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function guardApiRequest(
  request: Request,
  options?: ApiGuardOptions,
): Promise<NextResponse | null> {
  if (!options?.rateLimit) return null;

  const key = rateLimitKey(request, options.rateLimit.route);
  const result = await checkRateLimit({ ...options.rateLimit, key });

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)),
          ),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      },
    );
  }

  return null;
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { error: jsonError("Corps JSON invalide.", 400) };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      error: jsonError(parsed.error.issues[0]?.message ?? "Données invalides.", 400),
    };
  }

  return { data: parsed.data };
}

export function parseQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>,
): { data: T } | { error: NextResponse } {
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: jsonError(parsed.error.issues[0]?.message ?? "Paramètres invalides.", 400),
    };
  }

  return { data: parsed.data };
}
