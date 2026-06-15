import { Suspense } from "react";
import { ArrowRight, Ruler } from "lucide-react";

import { EditorialImage } from "@/components/media/editorial-image";
import { SizeAtelier } from "@/components/size-guide/size-atelier";
import { SizeAtelierSkeleton } from "@/components/size-guide/size-atelier-skeleton";
import { ButtonLink } from "@/components/ui/button-link";
import { hasActiveCatalogueProducts } from "@/lib/supabase/queries/products";

export async function HomeSizeGuideSection() {
  const catalogueHasProducts = await hasActiveCatalogueProducts();

  return (
    <section
      id="home-guide-tailles"
      className="home-maison-section maison-surface maison-surface-jade scroll-mt-20 border-y border-tilouki-mint/25"
      aria-labelledby="home-size-guide-title"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10">
          <div>
            <p className="text-retail-label text-tilouki-brand-blue mb-2 inline-flex items-center gap-1.5">
              <Ruler className="size-3.5" aria-hidden />
              Aide au choix
            </p>
            <h2 id="home-size-guide-title" className="text-section-title">
              L&apos;atelier des tailles
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed sm:text-base">
              Indiquez l&apos;âge et l&apos;usage pour un conseil rapide. Chaque fiche produit
              affiche la taille disponible — sans surprise au panier.
            </p>
            <EditorialImage
              imageId="size-guide"
              fill
              sizes="(max-width: 1024px) 100vw, 38vw"
              className="mt-6 aspect-[16/10] max-h-52 rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] lg:max-h-56"
            />
            <ButtonLink href="/guide-tailles" variant="outline" className="mt-5 min-h-11">
              Ouvrir l&apos;atelier complet
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>

          <Suspense fallback={<SizeAtelierSkeleton />}>
            <SizeAtelier variant="compact" catalogueHasProducts={catalogueHasProducts} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
