import type { Metadata } from "next";
import { XCircle } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Paiement échoué",
  robots: { index: false, follow: false },
};

export default function CommandeEchecPage() {
  return (
    <div className="container-tilouki section-tilouki max-w-lg">
      <Card className="text-center shadow-[var(--shadow-card)]">
        <CardContent className="space-y-4 p-8">
          <div className="bg-destructive/10 text-destructive mx-auto flex size-14 items-center justify-center rounded-full">
            <XCircle className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">Paiement non finalisé</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Votre paiement n&apos;a pas abouti. Aucun montant n&apos;a été débité. Les
            articles réservés temporairement seront libérés automatiquement. Vous pouvez
            réessayer depuis votre panier.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <ButtonLink href="/panier" className="rounded-full">
              Retour au panier
            </ButtonLink>
            <ButtonLink href="/catalogue" variant="outline" className="rounded-full">
              Continuer mes achats
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
