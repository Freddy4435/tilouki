import type { Metadata } from "next";

import { siteConfig } from "@/lib/constants/site";

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  ogImage?: string | null;
  ogType?: "website" | "article";
  articlePublishedTime?: string;
  articleModifiedTime?: string;
}

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function buildCanonicalFromSearchParams(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>,
  allowedKeys: string[],
): string {
  const params = new URLSearchParams();

  for (const key of allowedKeys) {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value?.trim()) params.set(key, value.trim());
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const title = input.title;
  const description = input.description;

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type: input.ogType ?? "website",
    locale: siteConfig.locale,
    url,
    siteName: siteConfig.name,
    title,
    description,
    ...(input.ogImage ? { images: [{ url: input.ogImage, alt: title }] } : {}),
    ...(input.ogType === "article" && input.articlePublishedTime
      ? {
          publishedTime: input.articlePublishedTime,
          modifiedTime: input.articleModifiedTime ?? input.articlePublishedTime,
        }
      : {}),
  };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: input.ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(input.ogImage ? { images: [input.ogImage] } : {}),
    },
    ...(input.noIndex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
  };
}
