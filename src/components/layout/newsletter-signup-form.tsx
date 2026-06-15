"use client";

import Link from "next/link";
import { useSyncExternalStore, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasCookieConsentChoice,
} from "@/lib/consent/cookies";
import { subscribeNewsletterAction } from "@/server/actions/newsletter";

function subscribeConsent(listener: () => void) {
  const onStorage = () => listener();
  const onConsent = () => listener();
  window.addEventListener("storage", onStorage);
  window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsent);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsent);
  };
}

function readConsentReady(): boolean {
  return hasCookieConsentChoice();
}

export function NewsletterSignupForm() {
  const consentReady = useSyncExternalStore(
    subscribeConsent,
    readConsentReady,
    () => true,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consentReady) return;

    const formData = new FormData(event.currentTarget);
    if (marketingConsent) formData.set("consent", "on");

    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await subscribeNewsletterAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(
        result.message ??
          "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.",
      );
      event.currentTarget.reset();
      setMarketingConsent(false);
    });
  };

  return (
    <div id="newsletter" className="space-y-3">
      <div>
        <p className="font-display text-lg font-semibold">La newsletter</p>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Les nouveautés du mercredi, les petits prix et les conseils tailles — une fois
          par mois, sans spam.
        </p>
      </div>

      {!consentReady ? (
        <p className="text-muted-foreground rounded-[var(--radius-card)] border border-dashed p-3 text-xs leading-relaxed">
          Pour vous inscrire, acceptez d&apos;abord les cookies via le bandeau en bas de
          page.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input type="hidden" name="source" value="footer" />
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
            <label htmlFor="newsletter-website">Site web</label>
            <input
              id="newsletter-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newsletter-email" className="sr-only">
              Adresse e-mail
            </Label>
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="votre@email.fr"
              required
              disabled={isPending}
              className="rounded-[var(--radius-button)]"
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="newsletter-consent"
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked === true)}
              disabled={isPending}
            />
            <Label
              htmlFor="newsletter-consent"
              className="text-muted-foreground text-xs leading-relaxed font-normal"
            >
              J&apos;accepte de recevoir la newsletter et j&apos;ai pris connaissance de
              la{" "}
              <Link
                href="/confidentialite"
                className="text-tilouki-teal-dark font-medium hover:underline"
              >
                politique de confidentialité
              </Link>
              .
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !marketingConsent}
          >
            {isPending ? "Inscription…" : "S'inscrire"}
          </Button>

          {error ? (
            <p className="text-destructive text-xs" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="text-tilouki-sage-dark text-xs" role="status">
              {message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
