import { CategoryGrid } from "@/components/home/category-grid";
import { HomeCarnetSection } from "@/components/home/home-carnet-section";
import { HomeComeBackSection } from "@/components/home/home-come-back-section";
import { HomeReadyLooksSection } from "@/components/home/home-ready-looks-section";
import { HomeReassuranceSection } from "@/components/home/home-reassurance-section";
import { HomeRitualsSection } from "@/components/home/home-rituals-section";
import { HomeSizeGuideSection } from "@/components/home/home-size-guide-section";
import { HomeVestiaireAssistant } from "@/components/home/home-vestiaire-assistant";
import { HomeVestiaireSection } from "@/components/home/home-vestiaire-section";
import { HomeYourSelectionSection } from "@/components/home/home-your-selection-section";
import { ProductRowSection } from "@/components/home/product-row-section";
import type { ReadyLook } from "@/lib/catalog/home-sections";
import { buildCatalogueHref } from "@/lib/navigation/catalog-href";
import type { Ritual } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

export interface HomeRitualModule {
  ritual: Ritual;
  products: ProductListItem[];
}

interface HomeBelowFoldProps {
  shopName: string;
  allProducts: ProductListItem[];
  newProducts: ProductListItem[];
  ritualModules: HomeRitualModule[];
  lastPieceProducts: ProductListItem[];
  readyLooks: ReadyLook[];
}

/**
 * Corps marchand accueil (sans hero) — miroir de `page.tsx` pour chargement différé.
 */
export function HomeBelowFold({
  shopName,
  allProducts,
  newProducts,
  ritualModules,
  lastPieceProducts,
  readyLooks,
}: HomeBelowFoldProps) {
  return (
    <>
      <HomeVestiaireAssistant products={allProducts} />

      <HomeVestiaireSection
        products={newProducts}
        viewAllHref={buildCatalogueHref({ sort: "newest" })}
      />

      <HomeRitualsSection modules={ritualModules} />

      <CategoryGrid />

      <ProductRowSection
        id="home-dernieres-tailles"
        title="Dernières tailles — stock court"
        description="Il ne reste que quelques pièces sur ces articles. Si la taille convient, c'est le moment."
        products={lastPieceProducts}
        viewAllHref={buildCatalogueHref()}
        variant="tinted"
        eyebrow="Stock limité"
        minProducts={1}
        priorityLimit={0}
        deferRender
      />

      <HomeYourSelectionSection />

      <HomeReadyLooksSection looks={readyLooks} />

      <HomeSizeGuideSection compact />

      <HomeReassuranceSection shopName={shopName} />

      <HomeComeBackSection />

      <HomeCarnetSection />
    </>
  );
}
