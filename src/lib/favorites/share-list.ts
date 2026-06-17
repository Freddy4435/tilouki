const TOKEN_PREFIX = "v1";
const MAX_SHARED_SLUGS = 30;

function toBase64Url(value: string): string {
  if (typeof btoa === "function") {
    return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(token: string): string | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    if (typeof atob === "function") {
      return atob(padded + pad);
    }
    return Buffer.from(padded + pad, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function encodeFavoritesListToken(slugs: string[]): string | null {
  const normalized = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))].slice(
    0,
    MAX_SHARED_SLUGS,
  );
  if (normalized.length === 0) return null;
  return toBase64Url(`${TOKEN_PREFIX}:${normalized.join(",")}`);
}

export function decodeFavoritesListToken(token: string): string[] {
  const decoded = fromBase64Url(token.trim());
  if (!decoded) return [];

  const [prefix, payload] = decoded.split(":", 2);
  if (prefix !== TOKEN_PREFIX || !payload) return [];

  return payload
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, MAX_SHARED_SLUGS);
}

export function buildSharedFavoritesPath(slugs: string[]): string | null {
  const token = encodeFavoritesListToken(slugs);
  if (!token) return null;
  return `/liste/${token}`;
}
