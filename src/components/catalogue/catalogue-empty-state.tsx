import Link from "next/link";
import { Ruler, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { buildCatalogueHref } from "@/lib/navigation/catalog-href";
import { NAV_HREF } from "@/lib/navigation/nav-config";

interface CatalogueEmptyStateProps {
  hasActiveFilters: boolean;
  resetHref?: string;
}

export function CatalogueEmptyState({
  hasActiveFilters,
  resetHref = "/catalogue",
}: CatalogueEmptyStateProps) {
  if (!hasActiveFilters) {
    return (
      <div className="border-tilouki-jade/20 bg-tilouki-cloud/50 rounded-[var(--radius-card)] border px-5 py-8 text-center sm:px-8">
        <h2 className="text-lg font-semibold">Aucun article pour le moment</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
          Revenez bientôt ou explorez le carnet et l&apos;atelier des tailles en
          attendant.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href="/" variant="default">
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/blog" variant="outline">
            Lire le carnet
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="border-tilouki-jade/25 bg-tilouki-jade-soft/30 rounded-[var(--radius-card)] border px-5 py-8 text-center sm:px-8">
      <h2 className="text-lg font-semibold">Aucun article pour cette sélection</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
        Essayez une autre tranche d&apos;âge ou élargissez vos filtres. Entre deux
        tailles, prenez la plus grande pour laisser de la marge à votre enfant.
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <ButtonLink href={resetHref} variant="default">
          Effacer les filtres
        </ButtonLink>
        <ButtonLink href={buildCatalogueHref({ sort: "newest" })} variant="outline">
          <Sparkles className="size-4" aria-hidden />
          Voir les nouveautés
        </ButtonLink>
      </div>
      <p className="text-muted-foreground mt-4 text-xs">
        <Link
          href={NAV_HREF.guideTailles}
          className="text-tilouki-teal-dark font-semibold hover:underline"
        >
          <Ruler className="mr-1 inline size-3.5 align-text-bottom" aria-hidden />
          Consulter l&apos;atelier des tailles
        </Link>
      </p>
    </div>
  );
}
