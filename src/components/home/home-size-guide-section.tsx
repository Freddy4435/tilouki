import { Suspense } from "react";
import { ArrowRight, Ruler } from "lucide-react";

import { EditorialImage } from "@/components/media/editorial-image";
import { SizeAtelier } from "@/components/size-guide/size-atelier";
import { SizeAtelierSkeleton } from "@/components/size-guide/size-atelier-skeleton";
import { ButtonLink } from "@/components/ui/button-link";
import { hasActiveCatalogueProducts } from "@/lib/supabase/queries/products";
import { cn } from "@/lib/utils";

interface HomeSizeGuideSectionProps {
  /** Moins de hauteur — bloc atelier prioritaire sur mobile. */
  compact?: boolean;
}

export async function HomeSizeGuideSection({
  compact = false,
}: HomeSizeGuideSectionProps = {}) {
  const catalogueHasProducts = await hasActiveCatalogueProducts();

  return (
    <section
      id="home-guide-tailles"
      className={cn(
        "home-maison-section maison-surface maison-surface-rose border-tilouki-rose-linge/20 scroll-mt-20 border-y",
        compact ? "py-8 md:py-10" : "section-tilouki py-10 md:py-12",
      )}
      aria-labelledby="home-size-guide-title"
    >
      <div className="container-tilouki">
        <div
          className={cn(
            "grid gap-6",
            compact
              ? "lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start lg:gap-8"
              : "gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10",
          )}
        >
          <div>
            <p className="text-retail-label text-tilouki-denim mb-2 inline-flex items-center gap-1.5">
              <Ruler className="size-3.5" aria-hidden />
              Guide des tailles
            </p>
            <h2 id="home-size-guide-title" className="text-section-title">
              Trouver la bonne taille
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
              Indiquez l&apos;âge et l&apos;usage pour cibler le catalogue. Chaque fiche
              affiche les tailles en stock.
            </p>
            {!compact ? (
              <EditorialImage
                imageId="size-guide"
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="mt-6 aspect-[16/10] max-h-52 rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] lg:max-h-56"
              />
            ) : null}
            <ButtonLink
              href="/guide-tailles"
              variant="outline"
              className="mt-4 min-h-11"
            >
              Voir le guide complet
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>

          <Suspense fallback={<SizeAtelierSkeleton />}>
            <SizeAtelier
              variant="compact"
              catalogueHasProducts={catalogueHasProducts}
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
