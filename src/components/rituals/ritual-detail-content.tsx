import { ArrowRight } from "lucide-react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { RitualEmptyState } from "@/components/rituals/ritual-empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import type { Ritual } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

interface RitualDetailContentProps {
  ritual: Ritual;
  products: ProductListItem[];
}

export function RitualDetailContent({ ritual, products }: RitualDetailContentProps) {
  const hasProducts = products.length > 0;

  return (
    <div className="space-y-6">
      <section aria-labelledby="ritual-products-title">
        <div className="mb-5 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 id="ritual-products-title" className="text-section-title">
              À acheter — {ritual.title.toLowerCase()}
            </h2>
            <p className="text-foreground mt-2 text-sm font-medium leading-relaxed">
              {ritual.promise}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Tailles indiquées sur chaque fiche — stock mis à jour en temps réel.
            </p>
          </div>
          <ButtonLink href={ritual.catalogueHref} className="min-h-11 shrink-0">
            {ritual.ctaLabel}
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>

        {hasProducts ? (
          <>
            <CatalogueProductList
              products={products}
              layout="scroll-mobile"
              priorityLimit={0}
            />
            <p className="text-muted-foreground mt-4 text-sm">{ritual.shoppingTip}</p>
          </>
        ) : (
          <RitualEmptyState ritual={ritual} />
        )}
      </section>
    </div>
  );
}
