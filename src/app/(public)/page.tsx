import type { Metadata } from "next";

import { HeroSection } from "@/components/home/hero-section";
import { HomeBelowFold } from "@/components/home/home-below-fold";
import { HomeYourSelectionSection } from "@/components/home/home-your-selection-section";
import { ProductRowSection } from "@/components/home/product-row-section";
import { ShippingHighlights } from "@/components/home/shipping-highlights";
import {
  buildReadyLooks,
  pickCategoryProducts,
  pickLastPieceProducts,
  pickLowPriceHomeProducts,
  pickWednesdayNewProducts,
} from "@/lib/catalog/home-sections";
import { resolveEditorialBlocks } from "@/lib/editorial/fallback";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCategories } from "@/lib/supabase/queries/categories";
import { getActiveProductsForHome } from "@/lib/supabase/queries/products";
import { hasPublishedProductReviews } from "@/lib/supabase/queries/reviews";
import { getShopSettings } from "@/lib/supabase/queries/shop";

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
  const [settings, categories, allProducts, hasPublishedReviews] = await Promise.all([
    getShopSettings(),
    getCategories(),
    getActiveProductsForHome(),
    hasPublishedProductReviews(),
  ]);

  const wednesdayNewProducts = pickWednesdayNewProducts(allProducts);
  const lowPriceProducts = pickLowPriceHomeProducts(allProducts);
  const lastPieceProducts = pickLastPieceProducts(allProducts);
  const babyProducts = pickCategoryProducts(allProducts, "bebe");
  const pyjamaProducts = pickCategoryProducts(allProducts, "pyjamas");
  const readyLooks = buildReadyLooks(allProducts);

  const editorialBlocks = resolveEditorialBlocks(
    settings.editorialBlocks ?? [],
    categories,
  );

  const featuredForHero = allProducts
    .filter((p) => p.primaryImageUrl)
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      primaryImageUrl: p.primaryImageUrl,
      minPriceCents: p.minPriceCents,
      categoryName: p.categoryName,
    }));

  return (
    <>
      <HeroSection
        shopName={settings.name}
        heroImageUrl={settings.heroImageUrl}
        featuredProducts={featuredForHero}
        categoryLinks={categories.map((c) => ({ slug: c.slug, label: c.name }))}
      />

      <ShippingHighlights shopName={settings.name} />

      <HomeYourSelectionSection />

      <ProductRowSection
        id="home-nouveautes"
        title="Les nouveautés du mercredi"
        description="Chaque mercredi, de nouvelles pièces peuvent rejoindre la boutique — voici les dernières arrivées, prêtes à rejoindre la garde-robe."
        products={wednesdayNewProducts}
        viewAllHref="/catalogue?tri=newest"
        priorityLimit={2}
      />

      <HomeBelowFold
        lowPriceProducts={lowPriceProducts}
        lastPieceProducts={lastPieceProducts}
        babyProducts={babyProducts}
        pyjamaProducts={pyjamaProducts}
        readyLooks={readyLooks}
        categories={categories}
        editorialBlocks={editorialBlocks}
        hasPublishedReviews={hasPublishedReviews}
      />
    </>
  );
}
