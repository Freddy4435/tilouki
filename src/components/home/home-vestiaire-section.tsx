import { ArrowRight } from "lucide-react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { EditorialImage } from "@/components/media/editorial-image";
import { ButtonLink } from "@/components/ui/button-link";
import { MIN_HOME_SECTION_PRODUCTS } from "@/lib/catalog/home-sections";
import type { ProductListItem } from "@/types/catalog";

interface HomeVestiaireSectionProps {
  products: ProductListItem[];
  viewAllHref: string;
}

function VestiaireEditorialFallback() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
      <EditorialImage
        imageId="colors-soft"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="aspect-[5/3] max-h-64 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] lg:aspect-[16/10] lg:max-h-none"
      />
      <div className="space-y-5">
        <div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Chaque mercredi, de nouvelles pièces peuvent rejoindre le vestiaire. En
            attendant les prochaines arrivées, parcourez le catalogue ou inscrivez-vous à
            la newsletter pour être prévenu·e en premier.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/catalogue" className="min-h-11">
              Parcourir le catalogue
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="#newsletter" variant="outline" className="min-h-11">
              S&apos;inscrire à la newsletter
            </ButtonLink>
          </div>
        </div>
        <div className="bg-card flex gap-4 overflow-hidden rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft)]">
          <EditorialImage
            imageId="newsletter"
            fill
            sizes="120px"
            className="relative hidden h-20 w-[7.5rem] shrink-0 rounded-[var(--radius-button)] sm:block"
          />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold">Une fois par mois, sans spam</p>
            <p className="text-muted-foreground mt-1">
              Nouveautés du mercredi, conseils tailles et petits prix — le formulaire est
              en bas de page.
            </p>
          </div>
        </div>
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
      className="home-maison-section maison-surface maison-surface-butter scroll-mt-20 border-y border-tilouki-peach/25"
      aria-labelledby="home-vestiaire-title"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <div>
            <div className="wednesday-accent-bar mb-2" aria-hidden />
            <p className="text-wednesday-label mb-1.5">Nouveautés</p>
            <h2 id="home-vestiaire-title" className="text-section-title text-tilouki-navy">
              À shopper cette semaine
            </h2>
            <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
              {hasProducts
                ? "Les dernières pièces ajoutées — tailles et stock affichés sur chaque fiche produit."
                : "De nouvelles pièces arrivent régulièrement. En attendant, parcourez le catalogue."}
            </p>
          </div>
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
              <ButtonLink href={viewAllHref} variant="outline" className="min-h-11 w-full">
                Voir tout le vestiaire
              </ButtonLink>
            </div>
          </>
        ) : (
          <VestiaireEditorialFallback />
        )}
      </div>
    </section>
  );
}
