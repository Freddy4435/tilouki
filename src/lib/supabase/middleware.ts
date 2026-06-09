import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import type { Database } from "@/types/database";

const ADMIN_PUBLIC_PATHS = ["/admin/login"];

const RATE_LIMITED_PREFIXES = [
  "/api/checkout/",
  "/api/cart/",
  "/api/shipping/relay-points",
  "/api/webhooks/stripe",
];

function applyRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  const matched = RATE_LIMITED_PREFIXES.find((prefix) => pathname.startsWith(prefix));
  if (!matched) return null;

  const limits: Record<string, { limit: number; windowSec: number }> = {
    "/api/checkout/": { limit: 10, windowSec: 60 },
    "/api/cart/": { limit: 30, windowSec: 60 },
    "/api/shipping/relay-points": { limit: 20, windowSec: 60 },
    "/api/webhooks/stripe": { limit: 100, windowSec: 60 },
  };

  const config = limits[matched] ?? { limit: 30, windowSec: 60 };
  const result = checkRateLimit({
    key: rateLimitKey(request, matched),
    ...config,
  });

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) {
    return applySecurityHeaders(rateLimited);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;

  if (!url || !key) {
    if (pathname.startsWith("/admin") && !ADMIN_PUBLIC_PATHS.includes(pathname)) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/admin/login", request.url)),
      );
    }
    return applySecurityHeaders(NextResponse.next({ request }));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if ((isAdminRoute && !isAdminLogin) || isAdminApi) {
    if (!user) {
      if (isAdminApi) {
        return applySecurityHeaders(
          NextResponse.json({ error: "Non autorisé." }, { status: 401 }),
        );
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      if (isAdminApi) {
        return applySecurityHeaders(
          NextResponse.json({ error: "Non autorisé." }, { status: 403 }),
        );
      }
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }
  }

  if (isAdminLogin && user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
    }
  }

  return applySecurityHeaders(supabaseResponse);
}
