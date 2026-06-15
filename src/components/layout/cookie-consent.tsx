"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  const saveConsent = useCallback((analytics: boolean) => {
    writeCookieConsent(analytics);
    notifyConsentListeners();
    setCustomizeOpen(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) {
      root.style.setProperty("--cookie-banner-height", "2.75rem");
    } else {
      root.style.removeProperty("--cookie-banner-height");
    }
    return () => {
      root.style.removeProperty("--cookie-banner-height");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Gestion des cookies"
        aria-describedby="cookie-consent-desc"
        className="border-border/70 bg-card/98 fixed inset-x-0 bottom-[var(--mobile-bottom-nav-height,0px)] z-[55] border-t shadow-[0_-2px_12px_oklch(0.28_0.02_50_/_0.06)] backdrop-blur-sm md:bottom-0"
      >
        <div className="container-tilouki flex min-h-[2.75rem] items-center gap-2 py-2 sm:gap-3">
          <p
            id="cookie-consent-desc"
            className="text-muted-foreground min-w-0 flex-1 text-[11px] leading-snug sm:text-xs"
          >
            Cookies essentiels pour le panier. Audience sur accord.{" "}
            <Link
              href="/cookies"
              className="text-primary font-medium underline-offset-2 hover:underline"
            >
              En savoir plus
            </Link>
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="hidden h-8 rounded-full px-2 text-[11px] sm:inline-flex"
              onClick={() => setCustomizeOpen(true)}
            >
              Personnaliser
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full px-2.5 text-[11px]"
              onClick={() => saveConsent(false)}
            >
              Refuser
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-3 text-[11px] font-semibold"
              onClick={() => saveConsent(true)}
            >
              OK
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Cookies</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-6 text-sm">
            <div className="flex items-start gap-2">
              <Checkbox id="cookie-essential" checked disabled />
              <Label
                htmlFor="cookie-essential"
                className="text-muted-foreground font-normal"
              >
                Essentiels (panier, paiement) — toujours actifs
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="cookie-analytics-opt"
                checked={analyticsChoice}
                onCheckedChange={(checked) => setAnalyticsChoice(checked === true)}
              />
              <Label htmlFor="cookie-analytics-opt" className="font-normal">
                Mesure d&apos;audience (optionnel)
              </Label>
            </div>
            <Button
              className="w-full rounded-full"
              onClick={() => saveConsent(analyticsChoice)}
            >
              Enregistrer
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Réinitialise le consentement (tests / debug). */
export function resetCookieConsentForTests(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    notifyConsentListeners();
  }
}
