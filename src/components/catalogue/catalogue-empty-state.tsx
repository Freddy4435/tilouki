import Link from "next/link";
import { CalendarHeart, Sparkles, Tag } from "lucide-react";

import { ArrivageNewsletterCta } from "@/components/newsletter/arrivage-newsletter-cta";
import { ButtonLink } from "@/components/ui/button-link";
import {
  buildCatalogueEmptyCopy,
  getAvailableSizesSuggestion,
  getCatalogueEmptySuggestions,
  getNearbyCapsuleSuggestions,
  getPopularSizeSuggestions,
} from "@/lib/catalog/catalogue-empty-suggestions";
import type { Category } from "@/types/catalog";

interface CatalogueEmptyStateProps {
  hasActiveFilters: boolean;
  resetHref?: string;
  categorySlug?: string;
  categoryName?: string;
  categories?: Category[];
}

export function CatalogueEmptyState({
  hasActiveFilters,
  resetHref = "/catalogue",
  categorySlug,
  categoryName,
  categories = [],
}: CatalogueEmptyStateProps) {
  const copy = buildCatalogueEmptyCopy({ hasActiveFilters, categoryName });
  const suggestions = getCatalogueEmptySuggestions({
    categorySlug,
    categories,
    hasActiveFilters,
  }).filter((item) => item.id !== "reset" && item.id !== "available-sizes");

  const capsuleSuggestions = getNearbyCapsuleSuggestions(categorySlug);
  const sizeSuggestions = getPopularSizeSuggestions(categorySlug);
  const availableSizes = getAvailableSizesSuggestion(categorySlug);

  if (!hasActiveFilters) {
    return (
      <div className="border-tilouki-argile/25 bg-tilouki-argile-soft/30 rounded-[var(--radius-card)] border px-4 py-7 text-center sm:px-8">
        <p className="text-retail-label text-tilouki-pistache inline-flex items-center justify-center gap-1.5">
          <CalendarHeart className="size-3.5" aria-hidden />
          Arrivage du mercredi
        </p>
        <h2 className="mt-2 text-lg font-semibold">{copy.title}</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
          {copy.body}
        </p>

        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href={availableSizes.href} className="min-h-11">
            {availableSizes.label}
          </ButtonLink>
          <ButtonLink href="/catalogue?tri=newest" variant="outline" className="min-h-11">
            <Sparkles className="size-4" aria-hidden />
            Voir les nouveautés
          </ButtonLink>
        </div>

        <SuggestionSection
          title="Voir les capsules proches"
          items={capsuleSuggestions}
          className="mt-6"
        />

        <SuggestionSection title="Autres rayons en stock" items={suggestions} className="mt-5" />

        <ArrivageNewsletterCta
          source={categorySlug ? `rayon-${categorySlug}` : "catalogue-vide"}
          variant={categorySlug ? "rayon" : "default"}
          categoryName={
            categoryName ??
            categories.find((category) => category.slug === categorySlug)?.name
          }
          notifyHeading="Me prévenir"
          className="mt-6 text-left"
        />
      </div>
    );
  }

  return (
    <div className="border-tilouki-denim/25 bg-tilouki-denim-soft/35 rounded-[var(--radius-card)] border px-4 py-7 sm:px-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{copy.title}</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
          {copy.body}
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href={resetHref} variant="default" className="min-h-11">
            {availableSizes.label}
          </ButtonLink>
          <ButtonLink
            href={
              categorySlug
                ? `/categorie/${categorySlug}?tri=newest`
                : "/catalogue?tri=newest"
            }
            variant="outline"
            className="min-h-11"
          >
            <Sparkles className="size-4" aria-hidden />
            Nouveautés du rayon
          </ButtonLink>
        </div>
      </div>

      <SuggestionSection
        title="Voir les capsules proches"
        items={capsuleSuggestions}
        className="mt-6"
      />

      <SuggestionSection title="Essayer plutôt" items={suggestions} className="mt-5" />

      <div className="mt-5">
        <p className="text-muted-foreground mb-2 text-center text-xs font-semibold tracking-wide uppercase">
          Tailles à essayer
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {sizeSuggestions.map((size) => (
            <li key={size.id}>
              <Link
                href={size.href}
                className="bg-tilouki-milk text-tilouki-navy border-tilouki-border hover:bg-tilouki-pistache-soft/60 inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors"
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
              className="bg-tilouki-milk text-tilouki-navy border-tilouki-border hover:bg-tilouki-pistache-soft/60 inline-flex min-h-9 max-w-full items-center rounded-full border px-3.5 text-sm font-semibold transition-colors"
            >
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
