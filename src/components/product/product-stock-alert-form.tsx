"use client";

import Link from "next/link";
import { useSyncExternalStore, useState, useTransition } from "react";
import { Bell, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasCookieConsentChoice,
} from "@/lib/consent/cookies";
import { subscribeStockAlertAction } from "@/server/actions/stock-alert";
import { cn } from "@/lib/utils";

interface StockAlertVariantOption {
  id: string;
  label: string;
}

interface ProductStockAlertFormProps {
  productId: string;
  productSlug: string;
  productName: string;
  /** Variantes en rupture proposées à l'alerte */
  outOfStockVariants: StockAlertVariantOption[];
  /** Variante pré-sélectionnée (PDP) */
  defaultVariantId?: string | null;
  className?: string;
  compact?: boolean;
}

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

export function ProductStockAlertForm({
  productId,
  productSlug,
  productName,
  outOfStockVariants,
  defaultVariantId,
  className,
  compact = false,
}: ProductStockAlertFormProps) {
  const consentReady = useSyncExternalStore(
    subscribeConsent,
    readConsentReady,
    () => true,
  );
  const [variantId, setVariantId] = useState(
    defaultVariantId ?? outOfStockVariants[0]?.id ?? "",
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);

  if (outOfStockVariants.length === 0) return null;

  const selected = outOfStockVariants.find((item) => item.id === variantId);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consentReady || !variantId) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    if (marketingConsent) formData.set("consent", "on");
    formData.set("variantId", variantId);
    formData.set("sizeLabel", selected?.label ?? "");

    startTransition(async () => {
      setError(null);
      try {
        const result = await subscribeStockAlertAction(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setMessage(
          result.message ??
            "Alerte enregistrée — nous vous écrirons dès le retour en stock.",
        );
        setMarketingConsent(false);
      } catch {
        setError("Une erreur est survenue. Réessayez dans quelques instants.");
      }
    });
  };

  return (
    <div
      className={cn(
        "border-tilouki-argile/35 bg-tilouki-argile-soft/30 space-y-3 rounded-[var(--radius-card)] border p-3.5",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Bell className="text-tilouki-argile mt-0.5 size-4 shrink-0" aria-hidden />
        <div>
          <p className={cn("font-semibold", compact ? "text-sm" : "text-base")}>
            Me prévenir quand ma taille revient
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {productName} — alerte e-mail dès réapprovisionnement.
          </p>
        </div>
      </div>

      {!consentReady ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          Acceptez les cookies via le bandeau en bas de page pour activer l&apos;alerte.
        </p>
      ) : message ? (
        <div className="flex items-start gap-2 text-sm" role="status">
          <Check className="text-tilouki-teal-dark mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="productSlug" value={productSlug} />
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          {outOfStockVariants.length > 1 ? (
            <div className="space-y-1.5">
              <Label htmlFor={`stock-alert-size-${productSlug}`} className="text-xs font-semibold">
                Taille en rupture
              </Label>
              <select
                id={`stock-alert-size-${productSlug}`}
                value={variantId}
                onChange={(event) => setVariantId(event.target.value)}
                className="border-input bg-background h-10 w-full rounded-[var(--radius-button)] border px-3 text-sm"
                disabled={isPending}
              >
                {outOfStockVariants.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="variantId" value={variantId} />
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="votre@email.fr"
              required
              disabled={isPending}
              className="rounded-[var(--radius-button)]"
              aria-label="E-mail pour l'alerte stock"
            />
            <Button type="submit" disabled={isPending || !marketingConsent} className="shrink-0">
              {isPending ? "Envoi…" : "M'alerter"}
            </Button>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id={`stock-alert-consent-${productSlug}`}
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked === true)}
              disabled={isPending}
            />
            <Label
              htmlFor={`stock-alert-consent-${productSlug}`}
              className="text-muted-foreground text-xs leading-relaxed font-normal"
            >
              J&apos;accepte de recevoir cette alerte et j&apos;ai lu la{" "}
              <Link href="/confidentialite" className="text-tilouki-pistache font-medium hover:underline">
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
