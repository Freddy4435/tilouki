"use client";

import { useMemo } from "react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { ButtonLink } from "@/components/ui/button-link";
import { useProductsBySlugs } from "@/hooks/use-products-by-slugs";
import { HOME_PRODUCT_LIMIT } from "@/lib/catalog/home-sections";
import { orderProductsByFavoriteSlugs } from "@/lib/favorites/page";
import { useFavoritesStore } from "@/lib/favorites/store";
import { orderProductsByRecentlyViewedSlugs } from "@/lib/recently-viewed/display";
import { entriesToSlugKey } from "@/lib/recently-viewed/slugs";
import { useRecentlyViewedStore } from "@/lib/recently-viewed/store";

function mergePersonalSlugs(favoriteSlugs: string[], recentSlugs: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (let index = favoriteSlugs.length - 1; index >= 0; index -= 1) {
    const slug = favoriteSlugs[index];
    if (seen.has(slug)) continue;
    seen.add(slug);
    merged.push(slug);
  }

  for (const slug of recentSlugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    merged.push(slug);
  }

  return merged.slice(0, HOME_PRODUCT_LIMIT);
}

function slugKeyToList(key: string): string[] {
  return key ? key.split("\0") : [];
}

export function HomeYourSelectionContent() {
  const favoriteSlugKey = useFavoritesStore((state) => state.slugs.join("\0"));
  const recentSlugKey = useRecentlyViewedStore((state) =>
    entriesToSlugKey(state.entries),
  );

  const favoriteSlugs = useMemo(
    () => slugKeyToList(favoriteSlugKey),
    [favoriteSlugKey],
  );
  const recentSlugs = useMemo(() => slugKeyToList(recentSlugKey), [recentSlugKey]);

  const slugs = useMemo(
    () => mergePersonalSlugs(favoriteSlugs, recentSlugs),
    [favoriteSlugs, recentSlugs],
  );

  const { products, isLoading } = useProductsBySlugs(slugs);

  const orderedProducts = useMemo(() => {
    if (!products) return [];

    const favorites = orderProductsByFavoriteSlugs(products, favoriteSlugs);
    const favoriteSlugSet = new Set(favorites.map((product) => product.slug));
    const recentOnly = orderProductsByRecentlyViewedSlugs(
      products.filter((product) => !favoriteSlugSet.has(product.slug)),
      recentSlugs,
    );

    return [...favorites, ...recentOnly].slice(0, HOME_PRODUCT_LIMIT);
  }, [products, favoriteSlugs, recentSlugs]);

  if (slugs.length === 0) return null;
  if (!isLoading && orderedProducts.length === 0) return null;

  return (
    <section
      id="home-votre-selection"
      className="border-tilouki-jade/15 bg-tilouki-cloud/40 scroll-mt-20 border-y py-10 md:py-12"
      aria-labelledby="home-your-selection-title"
    >
      <div className="container-tilouki">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-retail-label text-tilouki-teal-dark">Pour vous</p>
            <h2 id="home-your-selection-title" className="text-section-title mt-1">
              Votre sélection
            </h2>
            <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
              Favoris et articles consultés récemment — enregistrés sur cet appareil
              pour reprendre là où vous en étiez.
            </p>
          </div>
          <ButtonLink
            href="/favoris"
            variant="outline"
            className="hidden min-h-10 sm:inline-flex"
          >
            Mes favoris
          </ButtonLink>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={Math.min(slugs.length, 4)} />
        ) : (
          <CatalogueProductList products={orderedProducts} layout="scroll-mobile" />
        )}

        <div className="mt-6 sm:hidden">
          <ButtonLink href="/favoris" variant="outline" className="min-h-11 w-full">
            Ouvrir mes favoris
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
