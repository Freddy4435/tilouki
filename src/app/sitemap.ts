import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/metadata";
import { getSitemapEntries } from "@/lib/seo/sitemap-data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries();

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: entry.path.startsWith("/produit/") ? "weekly" : "monthly",
    priority: entry.path === "/" ? 1 : entry.path.startsWith("/produit/") ? 0.8 : 0.6,
  }));
}
