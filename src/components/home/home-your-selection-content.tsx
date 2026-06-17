"use client";

import Link from "next/link";
import { useMemo } from "react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { ButtonLink } from "@/components/ui/button-link";
import { useProductsBySlugs } from "@/hooks/use-products-by-slugs";
import { useConsultedSizesStore } from "@/lib/favorites/consulted-sizes-store";
import { orderProductsByFavoriteSlugs } from "@/lib/favorites/page";
import {
  buildConsultedSizeHref,
  buildPersonalizationSubtitle,
  hasPersonalHomeContent,
} from "@/lib/favorites/personalization";
import { useFavoritesStore } from "@/lib/favorites/store";
import { orderProductsByRecentlyViewedSlugs } from "@/lib/recently-viewed/display";
import { entriesToSlugKey } from "@/lib/recently-viewed/slugs";
import { useRecentlyViewedStore } from "@/lib/recently-viewed/store";
import { HOME_PRODUCT_LIMIT } from "@/lib/catalog/home-sections";

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
  const favoriteCount = useFavoritesStore((state) => state.slugs.length);
  const recentSlugKey = useRecentlyViewedStore((state) =>
    entriesToSlugKey(state.entries),
  );
  const recentCount = useRecentlyViewedStore((state) => state.entries.length);
  const consultedEntries = useConsultedSizesStore((state) => state.entries);
  const consultedSizeLabels = useMemo(() => {
    const labels: string[] = [];
    const seen = new Set<string>();

    for (let index = consultedEntries.length - 1; index >= 0; index -= 1) {
      const label = consultedEntries[index]!.label;
      if (seen.has(label)) continue;
      seen.add(label);
      labels.push(label);
    }

    return labels;
  }, [consultedEntries]);
  const consultedSizeCount = consultedEntries.length;

  const favoriteSlugs = useMemo(
    () => slugKeyToList(favoriteSlugKey),
    [favoriteSlugKey],
  );
  const recentSlugs = useMemo(() => slugKeyToList(recentSlugKey), [recentSlugKey]);

  const slugs = useMemo(
    () => mergePersonalSlugs(favoriteSlugs, recentSlugs),
    [favoriteSlugs, recentSlugs],
  );

  const signals = useMemo(
    () => ({ favoriteCount, recentCount, consultedSizeCount }),
    [favoriteCount, recentCount, consultedSizeCount],
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

  if (!hasPersonalHomeContent(signals)) return null;
  if (slugs.length > 0 && !isLoading && orderedProducts.length === 0) {
    if (consultedSizeLabels.length === 0) return null;
  }

  const subtitle = buildPersonalizationSubtitle(signals);

  return (
    <section
      id="home-votre-selection"
      className="border-tilouki-pistache/20 bg-tilouki-cloud/40 scroll-mt-20 border-y py-10 md:py-12"
      aria-labelledby="home-your-selection-title"
    >
      <div className="container-tilouki">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-retail-label text-tilouki-pistache">Pour vous</p>
            <h2 id="home-your-selection-title" className="text-section-title mt-1">
              Votre sélection
            </h2>
            <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
              {subtitle}
            </p>
          </div>
          {favoriteCount > 0 ? (
            <ButtonLink
              href="/favoris"
              variant="outline"
              className="hidden min-h-10 sm:inline-flex"
            >
              Mes favoris
            </ButtonLink>
          ) : null}
        </div>

        {consultedSizeLabels.length > 0 ? (
          <div className="mb-5">
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              Tailles consultées
            </p>
            <ul className="flex flex-wrap gap-2">
              {consultedSizeLabels.slice(0, 6).map((label) => (
                <li key={label}>
                  <Link
                    href={buildConsultedSizeHref(label)}
                    className="bg-tilouki-milk text-tilouki-navy border-tilouki-border hover:bg-tilouki-pistache-soft/60 inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {slugs.length > 0 ? (
          isLoading ? (
            <ProductGridSkeleton count={Math.min(slugs.length, 4)} />
          ) : orderedProducts.length > 0 ? (
            <CatalogueProductList products={orderedProducts} layout="scroll-mobile" />
          ) : null
        ) : null}

        {favoriteCount > 0 ? (
          <div className="mt-6 sm:hidden">
            <ButtonLink href="/favoris" variant="outline" className="min-h-11 w-full">
              Ouvrir mes favoris
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
