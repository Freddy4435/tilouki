"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  readCookieConsent,
} from "@/lib/consent/cookies";

function subscribeAnalytics(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function getAnalyticsSnapshot(): boolean {
  return hasAnalyticsConsent();
}

/**
 * Charge un script analytics uniquement après consentement explicite.
 * Configurer NEXT_PUBLIC_PLAUSIBLE_DOMAIN (ex. tilouki.fr) pour activer Plausible.
 */
export function ConsentGatedAnalytics() {
  const analyticsAllowed = useSyncExternalStore(
    subscribeAnalytics,
    getAnalyticsSnapshot,
    () => false,
  );

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();

  if (!analyticsAllowed || !plausibleDomain) return null;

  return (
    <Script
      defer
      data-domain={plausibleDomain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}

/** Exposé pour les tests unitaires. */
export function getStoredConsentForTests() {
  return readCookieConsent();
}
