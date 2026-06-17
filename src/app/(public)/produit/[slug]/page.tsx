import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecentlyViewedSection } from "@/components/recently-viewed/recently-viewed-section";
import { RecentlyViewedTracker } from "@/components/recently-viewed/recently-viewed-tracker";
import { ProductAccordions } from "@/components/product/product-accordions";
import { ProductCuratorPick } from "@/components/product/product-curator-pick";
import { ProductFacts } from "@/components/product/product-facts";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGalleryMainImage } from "@/components/product/product-gallery-main-image";
import { ProductOutfitSuggestions } from "@/components/product/product-outfit-suggestions";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductReviewsSection } from "@/components/product/product-reviews-section";
import { SizeGuide } from "@/components/product/size-guide";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { resolveProductCuratorContent } from "@/lib/catalog/product-page-content";
import {
  isLikelySecondHandProduct,
  countCommercialStorefrontImages,
  extractDocumentedDefects,
  filterCommercialProductImages,
  isProductStorefrontSellable,
} from "@/lib/catalog/product-sellability";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getProductBySlug, getRelatedProducts } from "@/lib/supabase/queries/products";

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };

  const title = product.seoTitle ?? product.name;
  const description =
    product.seoDescription ??
    product.shortDescription ??
    `${product.name} — vêtement enfant disponible sur Tilouki.`;

  const ogImage = product.images[0]?.url ?? product.primaryImageUrl ?? null;

  return buildPageMetadata({
    title,
    description,
    path: `/produit/${slug}`,
    ogImage,
    ogType: "website",
  });
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const reviewPageRaw = resolvedSearch.avis_page;
  const reviewPageValue = Array.isArray(reviewPageRaw)
    ? reviewPageRaw[0]
    : reviewPageRaw;
  const reviewPage = Math.max(1, Number(reviewPageValue ?? "1") || 1);

  const related = await getRelatedProducts(product.id, product.categoryId, 4);
  const commercialImages = filterCommercialProductImages(product.images);
  const commercialPhotoCount = countCommercialStorefrontImages(product.images);
  const sellable = isProductStorefrontSellable(product.images);
  const defects = extractDocumentedDefects(product.images);
  const curatorContent = resolveProductCuratorContent(
    product.description,
    product.shortDescription,
  );
  const secondHand = isLikelySecondHandProduct(
    [product.description, product.shortDescription].filter(Boolean).join(" "),
  );

  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Catalogue", path: "/catalogue" },
    ...(product.categorySlug && product.categoryName
      ? [{ name: product.categoryName, path: `/categorie/${product.categorySlug}` }]
      : []),
    { name: product.name, path: `/produit/${product.slug}` },
  ];

  return (
    <div className="container-tilouki section-tilouki pb-8 lg:pb-12">
      <RecentlyViewedTracker slug={product.slug} />
      <JsonLdScript
        data={[buildProductJsonLd(product), buildBreadcrumbJsonLd(breadcrumbs)]}
      />

      <Breadcrumbs items={breadcrumbs} className="mb-5" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10">
        {sellable && commercialImages.length === 1 ? (
          <ProductGalleryMainImage
            src={commercialImages[0]!.url}
            alt={commercialImages[0]!.alt ?? product.name}
            commercialCount={commercialPhotoCount}
            secondHand={secondHand}
            defects={defects}
          />
        ) : (
          <ProductGallery
            images={product.images}
            productName={product.name}
            sellable={sellable}
            secondHand={secondHand}
            defects={defects}
            showLowStockBadge={product.variants.some(
              (v) => v.stockQuantity > 0 && v.stockQuantity <= 2,
            )}
          />
        )}
        <ProductPurchasePanel key={product.slug} product={product} />
      </div>

      <div className="mt-8 space-y-6 lg:mt-10">
        <ProductFacts product={product} showTitle />

        <ProductOutfitSuggestions
          products={related}
          categorySlug={product.categorySlug}
          categoryName={product.categoryName}
        />

        {curatorContent ? <ProductCuratorPick note={curatorContent.note} /> : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:gap-8">
          <ProductAccordions
            product={product}
            descriptionOverride={curatorContent?.descriptionBody}
          />
          <SizeGuide
            sizes={product.sizes}
            ageLabels={product.ageLabels}
            gender={product.gender}
            material={product.material}
            secondHand={secondHand}
          />
        </div>
      </div>

      <ProductReviewsSection
        productId={product.id}
        productSlug={product.slug}
        page={reviewPage}
      />

      <RecentlyViewedSection
        excludeSlugs={[product.slug]}
        className="mt-12 border-t pt-10"
      />
    </div>
  );
}
