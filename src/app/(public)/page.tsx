import type { Metadata } from "next";

import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSection } from "@/components/home/hero-section";
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
import {
  buildReadyLooks,
  hasMinimumHomeProducts,
  pickLastPieceProducts,
  pickWednesdayNewProducts,
  resolveWeeklyNewProducts,
} from "@/lib/catalog/home-sections";
import { buildCatalogueHref } from "@/lib/navigation/catalog-href";
import { pickProductsForRitual } from "@/lib/rituals/pick-ritual-products";
import { getHomeRituals } from "@/lib/rituals/rituals";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getShopSettings } from "@/lib/supabase/queries/shop";
import { getActiveProductsForHome } from "@/lib/supabase/queries/products";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getShopSettings();

  return buildPageMetadata({
    title: `Vêtements enfants — ${settings.name}`,
    description: settings.description,
    path: "/",
  });
}

export default async function HomePage() {
  const [settings, allProducts] = await Promise.all([
    getShopSettings(),
    getActiveProductsForHome(),
  ]);

  const wednesdayNewProducts = pickWednesdayNewProducts(allProducts);
  const newProducts = hasMinimumHomeProducts(wednesdayNewProducts)
    ? wednesdayNewProducts
    : resolveWeeklyNewProducts(allProducts);

  const ritualModules = getHomeRituals().map((ritual) => ({
    ritual,
    products: pickProductsForRitual(allProducts, ritual),
  }));

  const lastPieceProducts = pickLastPieceProducts(allProducts);
  const readyLooks = buildReadyLooks(allProducts);

  return (
    <>
      <HeroSection shopName={settings.name} heroImageUrl={settings.heroImageUrl} />

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

      <HomeReassuranceSection shopName={settings.name} />

      <HomeComeBackSection />

      <HomeCarnetSection />
    </>
  );
}
