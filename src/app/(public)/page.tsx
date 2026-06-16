import type { Metadata } from "next";

import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSection } from "@/components/home/hero-section";
import { HomeCarnetSection } from "@/components/home/home-carnet-section";
import { HomeRitualsSection } from "@/components/home/home-rituals-section";
import { HomeVestiaireSection } from "@/components/home/home-vestiaire-section";
import {
  hasMinimumHomeProducts,
  pickWednesdayNewProducts,
  resolveWeeklyNewProducts,
} from "@/lib/catalog/home-sections";
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

  return (
    <>
      <HeroSection shopName={settings.name} heroImageUrl={settings.heroImageUrl} />

      <HomeVestiaireSection
        products={newProducts}
        viewAllHref="/catalogue?tri=newest"
      />

      <CategoryGrid />

      <HomeRitualsSection modules={ritualModules} />

      <HomeCarnetSection />
    </>
  );
}
