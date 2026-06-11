import type { Metadata } from "next";

import { CategoryGrid } from "@/components/home/category-grid";
import { FaqSection } from "@/components/home/faq-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomeValueProps } from "@/components/home/home-value-props";
import { ProductRowSection } from "@/components/home/product-row-section";
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
        tagline={settings.tagline}
        description={settings.description}
        heroImageUrl={settings.heroImageUrl}
        featuredProducts={featuredForHero}
        categoryLinks={categories.map((c) => ({ slug: c.slug, label: c.name }))}
      />

      <ProductRowSection
        title="Nouveautés"
        description="Les dernières pièces ajoutées — tailles et stock visibles sur chaque carte."
        products={newProducts}
        viewAllHref="/catalogue"
        emptyTitle="Pas encore de nouveautés"
        emptyDescription="Dès qu'un nouveau vêtement est publié, il apparaîtra ici. En attendant, parcourez le catalogue."
      />

      <CategoryGrid categories={categories} />

      <ProductRowSection
        title="Petits prix"
        description="Essentiels du quotidien à petits prix — idéal pour compléter la garde-robe."
        products={lowPriceProducts}
        viewAllHref="/catalogue?promo=petit-prix"
        emptyTitle="Pas de petits prix pour le moment"
        emptyDescription="Les bonnes affaires seront listées ici dès qu'elles seront disponibles."
        variant="tinted"
      />

      <HomeValueProps />

      <FaqSection />
    </>
  );
}
