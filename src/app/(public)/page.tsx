import type { Metadata } from "next";

import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSection } from "@/components/home/hero-section";
import { HomeCarnetSection } from "@/components/home/home-carnet-section";
import { HomeReassuranceSection } from "@/components/home/home-reassurance-section";
import { HomeRitualsSection } from "@/components/home/home-rituals-section";
import { HomeSizeGuideSection } from "@/components/home/home-size-guide-section";
import { HomeVestiaireSection } from "@/components/home/home-vestiaire-section";
import { ProductRowSection } from "@/components/home/product-row-section";
import { getPublishedBlogArticles } from "@/content/blog/articles";
import {
  pickLowPriceHomeProducts,
  pickWednesdayNewProducts,
} from "@/lib/catalog/home-sections";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCategories } from "@/lib/supabase/queries/categories";
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
  const [settings, allProducts, categories, latestArticles] = await Promise.all([
    getShopSettings(),
    getActiveProductsForHome(),
    getCategories(),
    Promise.resolve(getPublishedBlogArticles().slice(0, 3)),
  ]);

  const wednesdayNewProducts = pickWednesdayNewProducts(allProducts);
  const lowPriceProducts = pickLowPriceHomeProducts(allProducts);

  return (
    <>
      <HeroSection shopName={settings.name} heroImageUrl={settings.heroImageUrl} />

      <HomeVestiaireSection
        products={wednesdayNewProducts}
        viewAllHref="/catalogue?tri=newest"
      />

      <CategoryGrid categories={categories} />

      <ProductRowSection
        id="home-petits-prix"
        title="Petits prix du quotidien"
        description="Les essentiels à prix doux — tee-shirts, bodies et leggings pour compléter la garde-robe."
        products={lowPriceProducts}
        viewAllHref="/catalogue?promo=petit-prix"
        variant="tinted"
        priorityLimit={0}
        deferRender
      />

      <HomeRitualsSection />

      <HomeReassuranceSection shopName={settings.name} />

      <HomeSizeGuideSection />

      <HomeCarnetSection articles={latestArticles} />
    </>
  );
}
