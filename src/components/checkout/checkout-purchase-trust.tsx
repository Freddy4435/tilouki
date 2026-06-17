import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";

import { useOptionalShop } from "@/components/providers/shop-provider";
import { CHECKOUT_RETURN_SUMMARY } from "@/lib/shipping/delivery-copy";
import { cn } from "@/lib/utils";

interface CheckoutPurchaseTrustProps {
  className?: string;
  /** Affiche le résumé rétractation (étape paiement). */
  showReturnSummary?: boolean;
}

/** Preuves vérifiables avant paiement — pas d'avis ni de labels inventés. */
export function CheckoutPurchaseTrust({
  className,
  showReturnSummary = false,
}: CheckoutPurchaseTrustProps) {
  const shop = useOptionalShop();
  const contactEmail =
    shop?.contactEmailConfigured && shop.contactEmail ? shop.contactEmail : null;
  const hasReturnPolicy = Boolean(shop?.returnPolicy?.trim());

  return (
    <div
      className={cn(
        "bg-muted/25 text-muted-foreground space-y-2 rounded-[var(--radius-card)] border px-4 py-3 text-xs leading-relaxed",
        className,
      )}
    >
      <p className="text-foreground flex items-center gap-1.5 font-medium">
        <ShieldCheck className="text-primary size-3.5 shrink-0" aria-hidden />
        Paiement sécurisé via Stripe
      </p>
      <p>Carte bancaire, Apple Pay et Google Pay selon votre appareil — aucune carte enregistrée sur Tilouki.</p>
      {showReturnSummary && hasReturnPolicy ? <p>{CHECKOUT_RETURN_SUMMARY}</p> : null}
      <p>
        <Link
          href="/cgv"
          className="text-foreground font-medium underline underline-offset-4"
          target="_blank"
        >
          CGV
        </Link>
        {" · "}
        <Link
          href="/livraison-retours"
          className="text-foreground font-medium underline underline-offset-4"
          target="_blank"
        >
          Livraison &amp; retours
        </Link>
      </p>
      {contactEmail ? (
        <p className="flex items-center gap-1.5">
          <Mail className="size-3.5 shrink-0" aria-hidden />
          <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
            {contactEmail}
          </a>
        </p>
      ) : null}
    </div>
  );
}
