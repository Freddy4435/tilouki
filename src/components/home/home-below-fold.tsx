import { CategoryGrid } from "@/components/home/category-grid";
import { EditorialUniverseSection } from "@/components/home/editorial-universe-section";
import { FaqSection } from "@/components/home/faq-section";
import { HomeComeBackSection } from "@/components/home/home-come-back-section";
import { HomeReadyLooksSection } from "@/components/home/home-ready-looks-section";
import { HomeReviewsSection } from "@/components/home/home-reviews-section";
import { HomeSizeGuideSection } from "@/components/home/home-size-guide-section";
import { HomeValueProps } from "@/components/home/home-value-props";
import { ProductRowSection } from "@/components/home/product-row-section";
import type { ReadyLook } from "@/lib/catalog/home-sections";
import type { EditorialBlock } from "@/lib/editorial/types";
import type { Category, ProductListItem } from "@/types/catalog";

interface HomeBelowFoldProps {
  lowPriceProducts: ProductListItem[];
  lastPieceProducts: ProductListItem[];
  babyProducts: ProductListItem[];
  pyjamaProducts: ProductListItem[];
  readyLooks: ReadyLook[];
  categories: Category[];
  editorialBlocks: EditorialBlock[];
  hasPublishedReviews: boolean;
}

/** Sections accueil sous la ligne de flottaison — chargées en chunk séparé. */
export function HomeBelowFold({
  lowPriceProducts,
  lastPieceProducts,
  babyProducts,
  pyjamaProducts,
  readyLooks,
  categories,
  editorialBlocks,
  hasPublishedReviews,
}: HomeBelowFoldProps) {
  return (
    <>
      <HomeReadyLooksSection looks={readyLooks} />

      <ProductRowSection
        id="home-petits-prix"
        title="Petits prix, grand confort"
        description="Les essentiels du quotidien à prix doux — pour compléter sans culpabiliser."
        products={lowPriceProducts}
        viewAllHref="/catalogue?promo=petit-prix"
        variant="tinted"
        priorityLimit={0}
        deferRender
      />

      <ProductRowSection
        id="home-dernieres-pieces"
        title="Dernières pièces"
        description="Stock très limité sur ces articles — si la taille est la bonne, c'est le moment."
        products={lastPieceProducts}
        viewAllHref="/catalogue"
        priorityLimit={0}
        deferRender
      />

      <CategoryGrid categories={categories} />

      <ProductRowSection
        id="home-selection-bebe"
        title="Tout doux pour bébé"
        description="Bodies, gigoteuses et pièces cocon — sélectionnées pour les premiers mois."
        products={babyProducts}
        viewAllHref="/categorie/bebe"
        priorityLimit={0}
        deferRender
      />

      <ProductRowSection
        id="home-selection-pyjamas"
        title="Nuits paisibles"
        description="Pyjamas moelleux et faciles à enfiler — pour des soirées un peu plus sereines."
        products={pyjamaProducts}
        viewAllHref="/categorie/pyjamas"
        variant="tinted"
        priorityLimit={0}
        deferRender
      />

      <EditorialUniverseSection blocks={editorialBlocks} />

      <HomeComeBackSection />

      <HomeSizeGuideSection />

      <HomeValueProps />

      <HomeReviewsSection hasPublishedReviews={hasPublishedReviews} />

      <FaqSection />
    </>
  );
}
