import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { RecentlyViewedSection } from "@/components/recently-viewed/recently-viewed-section";
import { RecentlyViewedTracker } from "@/components/recently-viewed/recently-viewed-tracker";
import { ProductAccordions } from "@/components/product/product-accordions";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGalleryMainImage } from "@/components/product/product-gallery-main-image";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductReviewsSection } from "@/components/product/product-reviews-section";
import { SizeGuide } from "@/components/product/size-guide";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { resolveProductCuratorContent } from "@/lib/catalog/product-page-content";
import {
  isLikelySecondHandProduct,
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

  const related = await getRelatedProducts(product.id, product.categoryId);
  const sellable = isProductStorefrontSellable(product.images);
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
    <div className="container-tilouki section-tilouki pb-32 lg:pb-0">
      <RecentlyViewedTracker slug={product.slug} />
      <JsonLdScript
        data={[buildProductJsonLd(product), buildBreadcrumbJsonLd(breadcrumbs)]}
      />

      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
        {sellable && product.images.length === 1 ? (
          <ProductGalleryMainImage
            src={product.images[0]!.url}
            alt={product.images[0]!.alt ?? product.name}
          />
        ) : (
          <ProductGallery
            images={product.images}
            productName={product.name}
            sellable={sellable}
            showLowStockBadge={product.variants.some(
              (v) => v.stockQuantity > 0 && v.stockQuantity <= 2,
            )}
          />
        )}
        <ProductPurchasePanel product={product} />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem]">
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

      <RecentlyViewedSection
        excludeSlugs={[product.slug]}
        className="mt-16 border-t pt-12"
      />

      {related.length > 0 ? (
        <section
          className="mt-16 border-t pt-12"
          aria-labelledby="related-products-heading"
        >
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="related-products-heading" className="text-lg font-semibold">
              Vous aimerez aussi
            </h2>
            {product.categorySlug ? (
              <a
                href={`/categorie/${product.categorySlug}`}
                className="text-tilouki-teal-dark text-sm font-semibold hover:underline"
              >
                Voir toute la catégorie
              </a>
            ) : null}
          </div>
          <CatalogueProductList products={related} />
        </section>
      ) : null}

      <ProductReviewsSection
        productId={product.id}
        productSlug={product.slug}
        page={reviewPage}
      />
    </div>
  );
}
