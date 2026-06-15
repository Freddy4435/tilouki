import { Heart } from "lucide-react";

import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { ButtonLink } from "@/components/ui/button-link";

export function FavoritesEmptyState() {
  return (
    <div className="bg-card flex flex-col items-center gap-5 rounded-[var(--radius-card)] border border-dashed px-6 py-14 text-center shadow-[var(--shadow-soft)]">
      <div className="bg-tilouki-jade-soft flex size-16 items-center justify-center rounded-[var(--radius-card)]">
        <Heart className="text-tilouki-teal-dark size-7" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <p className="text-section-title">Vos favoris sont vides</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Touchez le cœur sur une fiche produit pour garder tailles et prix sous la
          main. Vos favoris restent sur cet appareil — comparez tranquillement avant de
          commander.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
        <ButtonLink href="/catalogue?tri=newest" size="lg" className="min-h-11 flex-1">
          Voir les nouveautés
        </ButtonLink>
        <ButtonLink
          href="/catalogue"
          variant="outline"
          size="lg"
          className="min-h-11 flex-1"
        >
          Explorer le catalogue
        </ButtonLink>
      </div>
      <div className="border-border/60 w-full max-w-lg border-t pt-5">
        <ReassuranceStrip variant="compact" />
      </div>
    </div>
  );
}
