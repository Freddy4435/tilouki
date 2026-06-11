"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";

import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";
import { useCartShipping } from "@/hooks/use-cart-shipping";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  variant?: "page" | "drawer";
  onContinueShopping?: () => void;
}

export function CartSummary({ variant = "page", onContinueShopping }: CartSummaryProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const { shippingCents } = useCartShipping();
  const totalCents = subtotalCents + shippingCents;
  const canCheckout = useCartStore((s) => s.canCheckout());
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const { isValidating, validate } = useCartValidation({ enabled: false });
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setCheckoutError(null);
    const isValid = await validate();

    if (!isValid) {
      setCheckoutError(
        "Certains articles ne sont plus disponibles en quantité suffisante. Ajustez votre panier.",
      );
      return;
    }

    closeDrawer();
    router.push("/commande");
  };

  if (items.length === 0) return null;

  return (
    <aside
      className={
        variant === "page"
          ? "h-fit rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28"
          : "space-y-4"
      }
    >
      {variant === "page" ? (
        <h2 className="font-heading text-lg font-semibold">Récapitulatif</h2>
      ) : null}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="font-semibold tabular-nums">{formatPrice(subtotalCents)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Livraison point relais</span>
          <span className="font-semibold tabular-nums">{formatPrice(shippingCents)}</span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Estimation Mondial Relay selon le poids. Expédié depuis la France.
        </p>
      </div>

      <Separator className={variant === "page" ? "my-4" : "my-2"} />

      <div className="flex justify-between text-base font-bold">
        <span>Total estimé</span>
        <span className="tabular-nums">{formatPrice(totalCents)}</span>
      </div>

      {checkoutError ? (
        <p className="text-destructive text-sm" role="alert">
          {checkoutError}
        </p>
      ) : null}

      <div className={variant === "page" ? "mt-4 space-y-2" : "space-y-2 pt-2"}>
        <Button
          size="lg"
          className="w-full rounded-full"
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
          Paiement sécurisé — étape suivante
        </p>

        {variant === "page" ? (
          <ButtonLink
            href="/catalogue"
            variant="outline"
            size="lg"
            className="w-full rounded-full"
          >
            Continuer mes achats
          </ButtonLink>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full rounded-full"
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
