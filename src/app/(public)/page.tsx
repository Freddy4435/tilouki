import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { preload } from "react-dom";

import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSection, resolveHeroImage } from "@/components/home/hero-section";
import { HomeVestiaireAssistantDeferred } from "@/components/home/home-vestiaire-assistant-deferred";
import { HomeVestiaireSection } from "@/components/home/home-vestiaire-section";
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

const HomeRitualsSection = dynamic(() =>
  import("@/components/home/home-rituals-section").then(
    (mod) => mod.HomeRitualsSection,
  ),
);
const HomeYourSelectionSection = dynamic(() =>
  import("@/components/home/home-your-selection-section").then(
    (mod) => mod.HomeYourSelectionSection,
  ),
);
const HomeReadyLooksSection = dynamic(() =>
  import("@/components/home/home-ready-looks-section").then(
    (mod) => mod.HomeReadyLooksSection,
  ),
);
const HomeSizeGuideSection = dynamic(() =>
  import("@/components/home/home-size-guide-section").then(
    (mod) => mod.HomeSizeGuideSection,
  ),
);
const HomeReassuranceSection = dynamic(() =>
  import("@/components/home/home-reassurance-section").then(
    (mod) => mod.HomeReassuranceSection,
  ),
);
const HomeComeBackSection = dynamic(() =>
  import("@/components/home/home-come-back-section").then(
    (mod) => mod.HomeComeBackSection,
  ),
);
const HomeCarnetSection = dynamic(() =>
  import("@/components/home/home-carnet-section").then((mod) => mod.HomeCarnetSection),
);

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

  const heroImage = resolveHeroImage(settings.heroImageUrl);
  preload(heroImage.src, { as: "image", fetchPriority: "high" });

  return (
    <>
      <HeroSection shopName={settings.name} heroImageUrl={settings.heroImageUrl} />

      <HomeVestiaireAssistantDeferred products={allProducts} />

      <HomeVestiaireSection
        products={newProducts}
        viewAllHref={buildCatalogueHref({ sort: "newest" })}
      />

      <HomeRitualsSection modules={ritualModules} />

      <div className="defer-below-fold">
        <CategoryGrid />
      </div>

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
