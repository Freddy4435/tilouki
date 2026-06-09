"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const CONSENT_KEY = "tilouki-cookie-consent";

let consentListeners: Array<() => void> = [];

function subscribeConsent(listener: () => void) {
  consentListeners.push(listener);
  return () => {
    consentListeners = consentListeners.filter((item) => item !== listener);
  };
}

function notifyConsentListeners() {
  consentListeners.forEach((listener) => listener());
}

function needsConsent(): boolean {
  return typeof window !== "undefined" && !localStorage.getItem(CONSENT_KEY);
}

export function CookieConsent() {
  const visible = useSyncExternalStore(subscribeConsent, needsConsent, () => false);

  const accept = useCallback((analytics: boolean) => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ essential: true, analytics, date: new Date().toISOString() }),
    );
    notifyConsentListeners();
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      className="border-border bg-background/95 fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-xl border p-4 shadow-lg backdrop-blur sm:inset-x-auto sm:right-6 sm:bottom-6 sm:left-auto"
    >
      <p className="text-sm leading-relaxed">
        Nous utilisons des cookies strictement nécessaires au panier et au paiement. Les cookies
        d&apos;analyse ne sont activés qu&apos;avec votre accord.{" "}
        <Link href="/cookies" className="text-primary underline-offset-4 hover:underline">
          En savoir plus
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" className="rounded-full" onClick={() => accept(true)}>
          Tout accepter
        </Button>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => accept(false)}>
          Essentiels uniquement
        </Button>
      </div>
    </div>
  );
}
