import Link from "next/link";
import { Sparkles, Tag } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import {
  getCatalogueEmptySuggestions,
  getPopularSizeSuggestions,
} from "@/lib/catalog/catalogue-empty-suggestions";
import type { Category } from "@/types/catalog";

interface CatalogueEmptyStateProps {
  hasActiveFilters: boolean;
  resetHref?: string;
  categorySlug?: string;
  categories?: Category[];
}

export function CatalogueEmptyState({
  hasActiveFilters,
  resetHref = "/catalogue",
  categorySlug,
  categories = [],
}: CatalogueEmptyStateProps) {
  const suggestions = getCatalogueEmptySuggestions({
    categorySlug,
    categories,
    hasActiveFilters,
  }).filter((item) => item.id !== "reset");

  const sizeSuggestions = getPopularSizeSuggestions(categorySlug);

  if (!hasActiveFilters) {
    return (
      <div className="border-tilouki-jade/20 bg-tilouki-cloud/50 rounded-[var(--radius-card)] border px-4 py-7 text-center sm:px-8">
        <h2 className="text-lg font-semibold">Ce rayon se remplit</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
          Les premières pièces arrivent chaque mercredi. En attendant, parcourez les
          autres rayons ou les nouveautés déjà en ligne.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href="/" variant="default">
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/catalogue?tri=newest" variant="outline">
            <Sparkles className="size-4" aria-hidden />
            Voir les nouveautés
          </ButtonLink>
        </div>

        <SuggestionSection title="Explorer d'autres rayons" items={suggestions} />
      </div>
    );
  }

  return (
    <div className="border-tilouki-jade/25 bg-tilouki-jade-soft/30 rounded-[var(--radius-card)] border px-4 py-7 sm:px-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Aucun article pour cette sélection</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
          Élargissez la taille ou changez de rayon — entre deux tailles, prenez la plus
          grande pour laisser de la marge à votre enfant.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href={resetHref} variant="default">
            Effacer les filtres
          </ButtonLink>
          <ButtonLink
            href={
              categorySlug
                ? `/categorie/${categorySlug}?tri=newest`
                : "/catalogue?tri=newest"
            }
            variant="outline"
          >
            <Sparkles className="size-4" aria-hidden />
            Nouveautés du rayon
          </ButtonLink>
        </div>
      </div>

      <SuggestionSection
        title="Essayer plutôt"
        items={suggestions}
        className="mt-6"
      />

      <div className="mt-5">
        <p className="text-muted-foreground mb-2 text-center text-xs font-semibold tracking-wide uppercase">
          Tailles populaires
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {sizeSuggestions.map((size) => (
            <li key={size.id}>
              <Link
                href={size.href}
                className="bg-card text-tilouki-navy border-tilouki-jade/25 hover:bg-tilouki-jade-soft/50 inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors"
              >
                {size.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SuggestionSection({
  title,
  items,
  className,
}: {
  title: string;
  items: { id: string; label: string; href: string; description?: string }[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-muted-foreground mb-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
        <Tag className="size-3.5" aria-hidden />
        {title}
      </p>
      <ul className="flex flex-wrap justify-center gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              title={item.description}
              className="bg-card text-tilouki-navy border-tilouki-jade/25 hover:bg-tilouki-jade-soft/50 inline-flex min-h-9 max-w-full items-center rounded-full border px-3.5 text-sm font-semibold transition-colors"
            >
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
