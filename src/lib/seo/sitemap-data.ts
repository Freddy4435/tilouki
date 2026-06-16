import "server-only";

import { unstable_cache } from "next/cache";

import { getPublishedBlogArticles } from "@/content/blog/articles";
import { LEGAL_PAGE_ROUTES } from "@/lib/legal/templates";
import { getAllRitualSlugs } from "@/lib/rituals/rituals";
import { CACHE_TAGS, REVALIDATE } from "@/lib/supabase/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export interface SitemapEntry {
  path: string;
  lastModified: Date;
}

async function fetchAllSitemapEntries(): Promise<SitemapEntry[]> {
  const now = new Date();
  const staticPages: SitemapEntry[] = [
    { path: "/", lastModified: now },
    { path: "/catalogue", lastModified: now },
    { path: "/guide-tailles", lastModified: now },
    { path: "/blog", lastModified: now },
    { path: "/livraison-retours", lastModified: now },
    { path: "/donnees-personnelles", lastModified: now },
    ...Object.values(LEGAL_PAGE_ROUTES).map((path) => ({ path, lastModified: now })),
  ];

  const blogPages: SitemapEntry[] = getPublishedBlogArticles().map((article) => ({
    path: `/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt),
  }));

  const ritualPages: SitemapEntry[] = getAllRitualSlugs().map((slug) => ({
    path: `/rituels/${slug}`,
    lastModified: now,
  }));

  if (!isSupabaseConfigured()) return [...staticPages, ...blogPages, ...ritualPages];

  const supabase = createPublicClient();

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false }),
    supabase
      .from("categories")
      .select("slug, created_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const productPages: SitemapEntry[] = (productsResult.data ?? []).map((row) => ({
    path: `/produit/${row.slug}`,
    lastModified: new Date(row.updated_at),
  }));

  const categoryPages: SitemapEntry[] = (categoriesResult.data ?? []).map((row) => ({
    path: `/categorie/${row.slug}`,
    lastModified: new Date(row.created_at),
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...ritualPages,
    ...categoryPages,
    ...productPages,
  ];
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  return unstable_cache(fetchAllSitemapEntries, ["sitemap-entries"], {
    tags: [CACHE_TAGS.products, CACHE_TAGS.categories],
    revalidate: REVALIDATE.categories,
  })();
}
