import { siteConfig } from "@/lib/constants/site";
import { absoluteUrl } from "@/lib/seo/metadata";
import type { ShopSettings } from "@/lib/shop/types";
import type { ProductDetail } from "@/types/catalog";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildOrganizationJsonLd(settings: ShopSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.name,
    url: siteConfig.url,
    description: settings.description,
    email: settings.contactEmail,
    areaServed: {
      "@type": "Country",
      name: "France",
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/catalogue")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildProductJsonLd(product: ProductDetail) {
  const images = product.images.map((image) => image.url).filter(Boolean);
  const primaryImage = images[0] ?? product.primaryImageUrl;

  const activeVariants = product.variants.filter((variant) => variant.isActive);
  const productUrl = absoluteUrl(`/produit/${product.slug}`);
  const availability =
    product.totalStock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const offers = activeVariants.map((variant) => ({
    "@type": "Offer",
    sku: variant.sku,
    price: (variant.priceCents / 100).toFixed(2),
    priceCurrency: siteConfig.currency,
    availability:
      variant.stockQuantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    url: productUrl,
    itemCondition: "https://schema.org/NewCondition",
  }));

  const aggregateOffer =
    offers.length > 1
      ? {
          "@type": "AggregateOffer",
          lowPrice: (product.minPriceCents / 100).toFixed(2),
          highPrice: (
            Math.max(...activeVariants.map((variant) => variant.priceCents)) / 100
          ).toFixed(2),
          priceCurrency: siteConfig.currency,
          offerCount: offers.length,
          availability,
          url: productUrl,
        }
      : offers[0] ?? {
          "@type": "Offer",
          price: (product.minPriceCents / 100).toFixed(2),
          priceCurrency: siteConfig.currency,
          availability,
          url: productUrl,
          itemCondition: "https://schema.org/NewCondition",
        };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription ?? product.shortDescription ?? product.description,
    image: primaryImage ? [primaryImage, ...images.filter((url) => url !== primaryImage)] : undefined,
    sku: product.variants.find((v) => v.isActive)?.sku,
    brand: {
      "@type": "Brand",
      name: product.brandLabel || siteConfig.name,
    },
    category: product.categoryName ?? undefined,
    offers: aggregateOffer,
  };
}

export function buildItemListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
