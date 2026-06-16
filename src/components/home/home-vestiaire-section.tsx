import { ArrowRight } from "lucide-react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ButtonLink } from "@/components/ui/button-link";
import { MIN_HOME_SECTION_PRODUCTS } from "@/lib/catalog/home-sections";
import type { ProductListItem } from "@/types/catalog";

interface HomeVestiaireSectionProps {
  products: ProductListItem[];
  viewAllHref: string;
}

function VestiaireCatalogueFallback() {
  return (
    <div className="surface-tactile space-y-4 rounded-[var(--radius-card)] p-5 sm:p-6">
      <p className="text-muted-foreground text-sm leading-relaxed">
        L&apos;arrivage du mercredi se prépare. En attendant, parcourez les rayons ou le
        catalogue pour voir le stock disponible.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <ButtonLink href="/catalogue" className="min-h-11">
          Voir tout le catalogue
          <ArrowRight className="size-4" />
        </ButtonLink>
        <ButtonLink href="#home-rayons" variant="outline" className="min-h-11">
          Choisir par âge
        </ButtonLink>
      </div>
    </div>
  );
}

export function HomeVestiaireSection({
  products,
  viewAllHref,
}: HomeVestiaireSectionProps) {
  const hasProducts = products.length >= MIN_HOME_SECTION_PRODUCTS;

  return (
    <section
      id="home-vestiaire"
      className="retail-section home-maison-section maison-surface maison-surface-butter border-tilouki-border/80 scroll-mt-20 border-y"
      aria-labelledby="home-vestiaire-title"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <header className="retail-section__header">
            <div className="wednesday-accent-bar" aria-hidden />
            <p className="text-wednesday-label">Mercredi</p>
            <h2
              id="home-vestiaire-title"
              className="text-section-title retail-section__title"
            >
              Arrivage du mercredi
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {hasProducts
                ? "Nouvelles pièces ajoutées cette semaine — tailles et stock sur chaque fiche."
                : "Les prochaines nouveautés arrivent bientôt."}
            </p>
          </header>
          {hasProducts ? (
            <ButtonLink
              href={viewAllHref}
              variant="outline"
              className="hidden min-h-10 sm:inline-flex"
            >
              Voir tout
            </ButtonLink>
          ) : null}
        </div>

        {hasProducts ? (
          <>
            <CatalogueProductList
              products={products}
              layout="scroll-mobile"
              priorityLimit={2}
            />
            <div className="mt-6 sm:hidden">
              <ButtonLink
                href={viewAllHref}
                variant="outline"
                className="min-h-11 w-full"
              >
                Voir tout l&apos;arrivage
              </ButtonLink>
            </div>
          </>
        ) : (
          <VestiaireCatalogueFallback />
        )}
      </div>
    </section>
  );
}
