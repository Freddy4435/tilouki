const ALLOWED_PREFIXES = ["/admin", "/auth/callback", "/compte", "/favoris"] as const;

/**
 * Valide un chemin de redirection interne (anti open-redirect).
 */
export function getSafeRedirectPath(
  next: string | null | undefined,
  fallback = "/admin",
): string {
  if (!next?.trim()) return fallback;

  const path = next.trim();

  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }

  if (path.includes("\\") || path.includes("\0")) {
    return fallback;
  }

  const isAllowed =
    path === "/admin" ||
    ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

  return isAllowed ? path : fallback;
}
