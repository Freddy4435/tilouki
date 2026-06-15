"use client";

import Link from "next/link";
import { useSyncExternalStore, useState, useTransition } from "react";
import { Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasCookieConsentChoice,
} from "@/lib/consent/cookies";
import { subscribeNewsletterAction } from "@/server/actions/newsletter";
import { cn } from "@/lib/utils";

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

function NewsletterSuccessMessage({ message }: { message: string }) {
  return (
    <div
      className="tilouki-motion-soft-in bg-tilouki-jade-soft/60 border-tilouki-jade/30 space-y-2 rounded-[var(--radius-card)] border p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="bg-tilouki-teal text-tilouki-milk flex size-8 shrink-0 items-center justify-center rounded-full">
          <Check className="size-4" aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="font-display text-sm font-semibold">C&apos;est noté — merci !</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

export interface NewsletterSignupFormProps {
  id?: string;
  source?: string;
  heading?: string;
  description?: string;
  className?: string;
}

export function NewsletterSignupForm({
  id = "newsletter",
  source = "footer",
  heading = "La newsletter",
  description = "Les nouveautés du mercredi, les petits prix et les conseils tailles — une fois par mois, sans spam.",
  className,
}: NewsletterSignupFormProps) {
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
    <div id={id} className={cn("space-y-3", className)}>
      <div>
        <p className="font-display text-lg font-semibold">{heading}</p>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{description}</p>
      </div>

      {!consentReady ? (
        <p className="text-muted-foreground rounded-[var(--radius-card)] border border-dashed p-3 text-xs leading-relaxed">
          Pour vous inscrire, acceptez d&apos;abord les cookies via le bandeau en bas de
          page.
        </p>
      ) : message ? (
        <NewsletterSuccessMessage message={message} />
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input type="hidden" name="source" value={source} />
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
            className={cn("w-full", isPending && "opacity-80")}
            disabled={isPending || !marketingConsent}
          >
            {isPending ? (
              "Inscription…"
            ) : (
              <>
                <Mail className="size-4" aria-hidden />
                S&apos;inscrire
              </>
            )}
          </Button>

          {error ? (
            <p className="text-destructive text-xs" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
