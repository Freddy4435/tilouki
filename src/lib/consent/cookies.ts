/** Gestion du consentement cookies (localStorage côté client). */

export const COOKIE_CONSENT_KEY = "tilouki-cookie-consent";
export const COOKIE_CONSENT_UPDATED_EVENT = "tilouki:cookie-consent-updated";

export interface CookieConsentState {
  essential: true;
  analytics: boolean;
  date: string;
}

export function parseCookieConsent(raw: string | null): CookieConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.essential !== true || typeof parsed.analytics !== "boolean") return null;
    return {
      essential: true,
      analytics: parsed.analytics,
      date: typeof parsed.date === "string" ? parsed.date : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  return parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
}

export function writeCookieConsent(analytics: boolean): CookieConsentState {
  const state: CookieConsentState = {
    essential: true,
    analytics,
    date: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: state }));
  }
  return state;
}

export function hasAnalyticsConsent(): boolean {
  return readCookieConsent()?.analytics === true;
}

export function needsCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(COOKIE_CONSENT_KEY);
}
