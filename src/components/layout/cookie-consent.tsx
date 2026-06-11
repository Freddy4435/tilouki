"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  COOKIE_CONSENT_KEY,
  needsCookieConsent,
  writeCookieConsent,
} from "@/lib/consent/cookies";

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

function readNeedsConsent(): boolean {
  return needsCookieConsent();
}

export function CookieConsent() {
  const visible = useSyncExternalStore(subscribeConsent, readNeedsConsent, () => false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  const saveConsent = useCallback((analytics: boolean) => {
    writeCookieConsent(analytics);
    notifyConsentListeners();
    setShowCustomize(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) {
      root.style.setProperty("--cookie-banner-height", showCustomize ? "9.5rem" : "3.75rem");
    } else {
      root.style.removeProperty("--cookie-banner-height");
    }
    return () => {
      root.style.removeProperty("--cookie-banner-height");
    };
  }, [visible, showCustomize]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      aria-describedby="cookie-consent-desc"
      className="border-border/80 bg-background/95 fixed inset-x-0 bottom-0 z-[60] border-t shadow-[0_-4px_24px_oklch(0.28_0.02_50_/_0.08)] backdrop-blur-md"
    >
      <div className="container-tilouki flex flex-col gap-3 py-3 sm:py-3.5">
        <p id="cookie-consent-desc" className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          Nous utilisons des cookies <strong>strictement nécessaires</strong> au panier et à la commande.
          Les cookies de mesure d&apos;audience ne sont déposés qu&apos;avec votre accord.{" "}
          <Link href="/cookies" className="text-primary font-medium underline-offset-2 hover:underline">
            Politique cookies
          </Link>
        </p>

        {showCustomize ? (
          <div className="rounded-lg border bg-card p-3 text-sm">
            <p className="mb-2 font-medium">Personnaliser vos choix</p>
            <div className="flex items-start gap-2">
              <Checkbox id="cookie-analytics" checked disabled />
              <Label htmlFor="cookie-analytics" className="text-muted-foreground leading-snug font-normal">
                Cookies essentiels (panier, sécurité, paiement Stripe) — toujours actifs
              </Label>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <Checkbox
                id="cookie-analytics-opt"
                checked={analyticsChoice}
                onCheckedChange={(checked) => setAnalyticsChoice(checked === true)}
              />
              <Label htmlFor="cookie-analytics-opt" className="leading-snug font-normal">
                Cookies de mesure d&apos;audience (optionnels)
              </Label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" className="rounded-full" onClick={() => saveConsent(analyticsChoice)}>
                Enregistrer mes choix
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => setShowCustomize(false)}
              >
                Retour
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="min-h-9 rounded-full px-3 text-xs"
              onClick={() => saveConsent(false)}
            >
              Refuser les cookies optionnels
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="min-h-9 rounded-full px-3 text-xs"
              onClick={() => setShowCustomize(true)}
            >
              Personnaliser
            </Button>
            <Button size="sm" className="min-h-9 rounded-full px-4 text-xs" onClick={() => saveConsent(true)}>
              Tout accepter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Réinitialise le consentement (tests / debug). */
export function resetCookieConsentForTests(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    notifyConsentListeners();
  }
}
