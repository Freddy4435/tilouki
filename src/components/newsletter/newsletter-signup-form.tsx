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
import { NEWSLETTER_MERCHANT_DESCRIPTION } from "@/lib/newsletter/copy";
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
      className="tilouki-motion-soft-in bg-tilouki-pistache-soft/50 border-tilouki-pistache/30 space-y-2 rounded-[var(--radius-card)] border p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="bg-tilouki-navy text-tilouki-milk flex size-8 shrink-0 items-center justify-center rounded-full">
          <Check className="size-4" aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="font-sans text-sm font-semibold">C&apos;est noté — merci !</p>
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
  compact?: boolean;
  submitLabel?: string;
}

export function NewsletterSignupForm({
  id = "newsletter",
  source = "footer",
  heading = "Arrivage du mercredi",
  description = NEWSLETTER_MERCHANT_DESCRIPTION,
  className,
  compact = false,
  submitLabel = "M'alerter",
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

    const form = event.currentTarget;
    const formData = new FormData(form);
    if (marketingConsent) formData.set("consent", "on");

    startTransition(async () => {
      setError(null);
      try {
        const result = await subscribeNewsletterAction(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setMessage(
          result.message ??
            "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.",
        );
        setMarketingConsent(false);
      } catch {
        setError("Une erreur est survenue. Réessayez dans quelques instants.");
      }
    });
  };

  return (
    <div id={id} className={cn("space-y-3", className)}>
      <div>
        <p className={cn("font-sans font-semibold", compact ? "text-base" : "text-lg")}>
          {heading}
        </p>
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
            <label htmlFor={`${id}-website`}>Site web</label>
            <input
              id={`${id}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className={cn("gap-2", compact ? "flex flex-col sm:flex-row" : "space-y-2")}>
            <div className={cn(compact && "min-w-0 flex-1")}>
              <Label htmlFor={`${id}-email`} className="sr-only">
                Adresse e-mail
              </Label>
              <Input
                id={`${id}-email`}
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

            <Button
              type="submit"
              className={cn(compact && "min-h-10 shrink-0 sm:px-5")}
              disabled={isPending || !marketingConsent}
            >
              {isPending ? (
                "Inscription…"
              ) : (
                <>
                  <Mail className="size-4" aria-hidden />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id={`${id}-consent`}
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked === true)}
              disabled={isPending}
            />
            <Label
              htmlFor={`${id}-consent`}
              className="text-muted-foreground text-xs leading-relaxed font-normal"
            >
              J&apos;accepte de recevoir les alertes arrivage et j&apos;ai pris connaissance
              de la{" "}
              <Link
                href="/confidentialite"
                className="text-tilouki-pistache font-medium hover:underline"
              >
                politique de confidentialité
              </Link>
              .
            </Label>
          </div>

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
