import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ProductAccordions } from "@/components/product/product-accordions";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { SizeGuide } from "@/components/product/size-guide";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getProductBySlug, getRelatedProducts } from "@/lib/supabase/queries/products";

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId);

  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Catalogue", path: "/catalogue" },
    ...(product.categorySlug && product.categoryName
      ? [{ name: product.categoryName, path: `/categorie/${product.categorySlug}` }]
      : []),
    { name: product.name, path: `/produit/${product.slug}` },
  ];

  return (
    <div className="container-tilouki section-tilouki">
      <JsonLdScript
        data={[buildProductJsonLd(product), buildBreadcrumbJsonLd(breadcrumbs)]}
      />

      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductPurchasePanel product={product} />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ProductAccordions product={product} />
        <SizeGuide />
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t pt-12" aria-labelledby="related-products-heading">
          <h2 id="related-products-heading" className="font-heading mb-6 text-2xl font-semibold">
            Produits similaires
          </h2>
          <CatalogueProductList products={related} />
        </section>
      ) : null}
    </div>
  );
}
