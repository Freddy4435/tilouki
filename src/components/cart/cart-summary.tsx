"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";

import { FreeShippingProgressBar } from "@/components/cart/free-shipping-progress";
import { RitualBundleBanner } from "@/components/cart/ritual-bundle-banner";
import { OrderTotalsBreakdown } from "@/components/commerce/order-totals-breakdown";
import { trackRetailEvent } from "@/lib/analytics/retail-events";
import { previewRitualBundleDiscount } from "@/lib/cart/ritual-bundle-discount";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";
import { useCartShipping } from "@/hooks/use-cart-shipping";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { CHECKOUT_CLIENT_MESSAGES } from "@/lib/checkout/client-messages";
import { useCartStore } from "@/lib/cart/store";

interface CartSummaryProps {
  variant?: "page" | "drawer";
  onContinueShopping?: () => void;
}

export function CartSummary({
  variant = "page",
  onContinueShopping,
}: CartSummaryProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const carrier = useCartStore((s) => s.carrier);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const { shippingCents, rateLabel } = useCartShipping();
  const bundleDiscount = previewRitualBundleDiscount(subtotalCents, items.length);
  const canCheckout = useCartStore((s) => s.canCheckout());
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const { isValidating, validate } = useCartValidation({ enabled: false });
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setCheckoutError(null);
    const isValid = await validate();

    if (!isValid) {
      setCheckoutError(CHECKOUT_CLIENT_MESSAGES.stockChanged);
      return;
    }

    trackRetailEvent("begin_checkout", {
      item_count: items.length,
      value_cents: subtotalCents,
      source: variant,
    });

    closeDrawer();
    router.push("/commande");
  };

  if (items.length === 0) return null;

  return (
    <aside
      className={
        variant === "page"
          ? "bg-card h-fit rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28"
          : "space-y-4"
      }
    >
      {variant === "page" ? (
        <div>
          <h2 className="text-lg font-semibold">Récapitulatif</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Montants TTC — livraison estimée au point relais.
          </p>
        </div>
      ) : null}

      <FreeShippingProgressBar
        subtotalCents={subtotalCents}
        compact={variant === "drawer"}
        className="mb-3"
      />

      <RitualBundleBanner
        subtotalCents={subtotalCents}
        distinctLineCount={items.length}
        compact={variant === "drawer"}
        className="mb-3"
      />

      <OrderTotalsBreakdown
        subtotalCents={subtotalCents}
        shippingCents={shippingCents}
        discountCents={bundleDiscount.discountCents}
        discountLabel={bundleDiscount.label || "Remise tenue Tilouki"}
        shippingNote={`Estimation selon le poids (tranche ${rateLabel}). Expédié depuis la France.`}
        carrier={carrier}
        showDeliveryEstimate
        totalLabel="Total estimé TTC"
      />

      {checkoutError ? (
        <p className="text-destructive mt-3 text-sm" role="alert">
          {checkoutError}
        </p>
      ) : null}

      <Separator className={variant === "page" ? "my-4" : "my-2"} />

      <div className={variant === "page" ? "space-y-2" : "space-y-2 pt-0"}>
        <Button
          size="lg"
          className="w-full"
          disabled={!canCheckout || isValidating}
          onClick={() => void handleCheckout()}
        >
          {isValidating ? (
            "Vérification du stock…"
          ) : (
            <>
              <Lock className="size-4" />
              Passer commande
            </>
          )}
        </Button>

        <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-center text-xs">
          <ShieldCheck className="text-primary size-3.5 shrink-0" aria-hidden />
          Paiement sécurisé Stripe à l&apos;étape suivante
        </p>

        {variant === "page" ? (
          <ButtonLink href="/catalogue" variant="outline" size="lg" className="w-full">
            Continuer mes achats
          </ButtonLink>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onContinueShopping ?? closeDrawer}
          >
            Continuer mes achats
          </Button>
        )}

        {variant === "drawer" ? (
          <ButtonLink
            href="/panier"
            variant="ghost"
            className="w-full"
            onClick={() => closeDrawer()}
          >
            Voir le panier complet
          </ButtonLink>
        ) : null}
      </div>

      {variant === "page" ? (
        <div className="border-border/60 mt-5 border-t pt-4">
          <ReassuranceStrip variant="compact" />
        </div>
      ) : null}
    </aside>
  );
}
