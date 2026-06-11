import type { NextResponse } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
};

/** Génère le nonce CSP par requête (middleware) — 128 bits encodés base64. */
export function generateCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

/*
 * CSP à nonce + 'strict-dynamic' (doc Next.js « Content Security Policy »).
 *
 * Navigateurs modernes (CSP3) : seuls les scripts portant le nonce s'exécutent,
 * et la confiance se propage aux scripts qu'ils chargent dynamiquement
 * ('strict-dynamic' — nécessaire au widget Mondial Relay, dont le loader nonce
 * injecte lui-même le bundle versionné et Leaflet). La liste blanche de
 * domaines et 'unsafe-inline' sont alors IGNORÉS.
 *
 * Navigateurs anciens (CSP2) : nonce et 'strict-dynamic' inconnus → repli sur
 * la liste blanche de domaines + 'unsafe-inline' (fallback assumé, sinon le
 * site serait inutilisable sur ces navigateurs).
 *
 * 'unsafe-eval' : supprimé en production. En développement uniquement, React
 * Refresh / outils de debug en dépendent encore (même compromis que la doc).
 */
export function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  // Optionnel : collecte des violations CSP (ex. https://….report-uri.com/r/d/csp/enforce).
  const reportUri = process.env.CSP_REPORT_URI?.trim();

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    // Propage la confiance du nonce aux scripts chargés dynamiquement (widget MR → bundle + Leaflet).
    "'strict-dynamic'",
    // Fallback CSP2 uniquement — ignoré par les navigateurs modernes en présence du nonce.
    "'unsafe-inline'",
    // Dev uniquement : React Refresh / debug. Jamais émis en production.
    ...(isDev ? ["'unsafe-eval'"] : []),
    // Stripe.js (paiement) — fallback CSP2, et prêt pour un éventuel embed futur.
    "https://js.stripe.com",
    // Loader + bundle du widget Mondial Relay Parcel Shop Picker v4 — fallback CSP2.
    "https://widget.mondialrelay.com",
    // jQuery requis par le plugin Mondial Relay — fallback CSP2.
    "https://code.jquery.com",
    // leaflet.js chargé par le widget Mondial Relay — fallback CSP2.
    "https://unpkg.com",
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    // 'unsafe-inline' requis pour les attributs style React/Radix ; thèmes CSS du widget MR + leaflet.css.
    "style-src 'self' 'unsafe-inline' https://widget.mondialrelay.com https://unpkg.com",
    // Images produits Supabase Storage ; pins/thèmes widget MR ; photo du point relais (www.mondialrelay.com) ;
    // tuiles OpenStreetMap de la carte Leaflet ; icônes marqueurs référencées par leaflet.css (unpkg).
    "img-src 'self' data: blob: https://*.supabase.co https://widget.mondialrelay.com https://www.mondialrelay.com https://*.tile.openstreetmap.org https://unpkg.com",
    "font-src 'self' data:",
    // XHR/WebSocket : Supabase (données + realtime), Stripe API, API Mondial Relay + XHR du widget.
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.mondialrelay.com https://widget.mondialrelay.com wss://*.supabase.co",
    // Iframes : 3D Secure Stripe ; popups internes du widget Mondial Relay.
    "frame-src https://js.stripe.com https://widget.mondialrelay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (reportUri) {
    // report-uri (legacy) + report-to (Reporting API) — voir Reporting-Endpoints ci-dessous.
    directives.push(`report-uri ${reportUri}`, "report-to csp-endpoint");
  }

  return directives.join("; ");
}

export function applySecurityHeaders(response: NextResponse, csp: string): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  response.headers.set("Content-Security-Policy", csp);

  const reportUri = process.env.CSP_REPORT_URI?.trim();
  if (reportUri) {
    response.headers.set("Reporting-Endpoints", `csp-endpoint="${reportUri}"`);
  }

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}
