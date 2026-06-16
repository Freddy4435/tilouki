import { CatalogueQuickChips } from "@/components/catalogue/catalogue-quick-chips";
import { CatalogueRetailBanner } from "@/components/catalogue/catalogue-retail-banner";
import { CatalogueSortSelect } from "@/components/catalogue/catalogue-sort-select";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { cn } from "@/lib/utils";

interface CatalogueRayonBannerProps {
  title: string;
  productCount: number;
  image: { src: string; alt: string };
  eyebrow?: string;
  cta?: { label: string; href: string };
  className?: string;
}

/** Bandeau rayon — titre h1, volume et visuel (sans dépendance searchParams). */
export function CatalogueRayonBanner({
  title,
  productCount,
  image,
  eyebrow,
  cta,
  className,
}: CatalogueRayonBannerProps) {
  return (
    <CatalogueRetailBanner
      title={title}
      productCount={productCount}
      eyebrow={eyebrow}
      image={image}
      cta={cta}
      className={className}
    />
  );
}

interface CatalogueRayonToolsProps {
  categorySlug?: string;
  showSort?: boolean;
  productCount?: number;
  className?: string;
}

/** Chips, tri desktop et réassurance — à envelopper dans Suspense (useSearchParams). */
export function CatalogueRayonTools({
  categorySlug,
  showSort = true,
  productCount = 0,
  className,
}: CatalogueRayonToolsProps) {
  const canSort = showSort && productCount > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex min-w-0 flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <CatalogueQuickChips categorySlug={categorySlug} className="min-w-0 flex-1" />
        {canSort ? (
          <CatalogueSortSelect
            className="hidden shrink-0 lg:flex"
            triggerClassName="min-h-9 rounded-full"
          />
        ) : null}
      </div>

      <ReassuranceStrip
        variant="compact"
        className="justify-start text-[11px] sm:text-xs lg:justify-start"
      />
    </div>
  );
}

interface CatalogueRayonHeaderProps extends CatalogueRayonBannerProps {
  categorySlug?: string;
  showSort?: boolean;
}

/** En-tête rayon complet — préférer Banner + Tools (Suspense) sur les pages catalogue. */
export function CatalogueRayonHeader({
  title,
  productCount,
  image,
  eyebrow,
  cta,
  categorySlug,
  showSort = true,
  className,
}: CatalogueRayonHeaderProps) {
  return (
    <header className={cn("mb-4 space-y-3 sm:mb-5", className)}>
      <CatalogueRayonBanner
        title={title}
        productCount={productCount}
        eyebrow={eyebrow}
        image={image}
        cta={cta}
      />
      <CatalogueRayonTools
        categorySlug={categorySlug}
        showSort={showSort}
        productCount={productCount}
      />
    </header>
  );
}
