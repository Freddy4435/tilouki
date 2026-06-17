import { Package } from "lucide-react";

import { CatalogueCapsuleCard } from "@/components/catalogue/catalogue-capsule-card";
import { CatalogueEmptyState } from "@/components/catalogue/catalogue-empty-state";
import {
  buildCatalogueCapsuleModules,
  catalogueCapsulesHaveProducts,
  type CatalogueCapsuleModule,
} from "@/lib/rituals/catalogue-capsules";
import { getNearbyCapsuleSuggestions } from "@/lib/catalog/catalogue-empty-suggestions";
import { hasCatalogueFiltersInQuery } from "@/lib/catalog/catalogue-search-params";
import type { CatalogueQuery, Category, ProductListItem } from "@/types/catalog";
import Link from "next/link";

interface CatalogueCapsulesViewProps {
  products: ProductListItem[];
  query: CatalogueQuery;
  categories: Category[];
  categorySlug?: string;
}

export function CatalogueCapsulesView({
  products,
  query,
  categories,
  categorySlug,
}: CatalogueCapsulesViewProps) {
  const modules = buildCatalogueCapsuleModules(products, categorySlug);
  const hasProducts = catalogueCapsulesHaveProducts(modules);
  const hasFilters = hasCatalogueFiltersInQuery(query);

  return (
    <div className="space-y-5">
      {!hasProducts ? (
        <div className="border-tilouki-argile/30 bg-tilouki-argile-soft/30 space-y-3 rounded-[var(--radius-card)] border px-4 py-4 sm:px-5">
          <div className="flex gap-3">
            <Package className="text-tilouki-pistache mt-0.5 size-5 shrink-0" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold">Capsules en cours de remplissage</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nouvelles pièces chaque mercredi. Explorez les capsules proches ou les
                rayons déjà en stock.
              </p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2">
            {getNearbyCapsuleSuggestions(categorySlug).map((capsule) => (
              <li key={capsule.id}>
                <Link
                  href={capsule.href}
                  className="bg-tilouki-milk text-tilouki-navy border-tilouki-border hover:bg-tilouki-pistache-soft/60 inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors"
                >
                  {capsule.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasFilters && !hasProducts ? (
        <CatalogueEmptyState
          hasActiveFilters={hasFilters}
          categorySlug={categorySlug}
          categories={categories}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module: CatalogueCapsuleModule) => (
          <CatalogueCapsuleCard key={module.ritual.slug} module={module} />
        ))}
      </div>
    </div>
  );
}
