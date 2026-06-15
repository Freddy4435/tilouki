import { z } from "zod";

export const TRACKING_TOKEN_EMPTY_MESSAGE = "Veuillez saisir votre numéro de suivi.";

export const TRACKING_TOKEN_INVALID_MESSAGE = "Numéro de suivi invalide.";

export const trackingTokenSchema = z
  .string()
  .trim()
  .min(1, TRACKING_TOKEN_EMPTY_MESSAGE)
  .uuid(TRACKING_TOKEN_INVALID_MESSAGE);

export type TrackingTokenLookupValidation =
  | { ok: true; token: string }
  | { ok: false; error: string };

export function validateTrackingTokenLookup(
  raw: string,
): TrackingTokenLookupValidation {
  const parsed = trackingTokenSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, token: parsed.data };
  }

  const message = parsed.error.issues[0]?.message ?? TRACKING_TOKEN_INVALID_MESSAGE;
  return { ok: false, error: message };
}

export function resolveInitialTrackingToken(
  initialToken: string | undefined,
  tokenFromUrl: string | null,
  browserToken: string | null = null,
): string {
  return (initialToken ?? tokenFromUrl ?? browserToken ?? "").trim();
}

export function readTrackingTokenFromBrowserUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("token");
}
