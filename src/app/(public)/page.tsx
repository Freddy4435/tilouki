import type { Metadata } from "next";

import { CategoryGrid } from "@/components/home/category-grid";
import { FaqSection } from "@/components/home/faq-section";
import { HeroSection } from "@/components/home/hero-section";
import { ProductRowSection } from "@/components/home/product-row-section";
import { ShippingHighlights } from "@/components/home/shipping-highlights";
import { TrustSection } from "@/components/layout/trust-section";
import { filterLowPriceProducts } from "@/lib/catalog/sort-products";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCategories } from "@/lib/supabase/queries/categories";
import { getActiveProducts } from "@/lib/supabase/queries/products";
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
  const [settings, categories, allProducts] = await Promise.all([
    getShopSettings(),
    getCategories(),
    getActiveProducts(),
  ]);

  const newProducts = allProducts.slice(0, 8);
  const lowPriceProducts = filterLowPriceProducts(allProducts).slice(0, 8);

  return (
    <>
      <HeroSection
        shopName={settings.name}
        tagline={settings.tagline}
        description={settings.description}
      />

      <CategoryGrid categories={categories} />

      <ProductRowSection
        title="Nouveautés"
        description="Les derniers vêtements enfants ajoutés à la boutique."
        products={newProducts}
        viewAllHref="/catalogue"
        emptyTitle="Pas encore de nouveautés"
        emptyDescription="Les nouveaux produits publiés apparaîtront ici."
      />

      <ProductRowSection
        title="Petits prix"
        description="Tee-shirts, sweats et pièces du quotidien à prix doux."
        products={lowPriceProducts}
        viewAllHref="/catalogue?promo=petit-prix"
        emptyTitle="Pas de petits prix pour le moment"
        emptyDescription="Les promotions apparaîtront ici lorsqu'elles seront disponibles."
      />

      <ShippingHighlights shopName={settings.name} />

      <TrustSection />

      <FaqSection />
    </>
  );
}
