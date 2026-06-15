import type { AdminProductDetail } from "@/lib/supabase/queries/admin/products";
import type { ProductDetail } from "@/types/catalog";

export interface ProductPreviewInput {
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  material?: string | null;
  season?: string | null;
  brandLabel?: string;
  madeIn?: string | null;
  careInstructions?: string | null;
  gender: ProductDetail["gender"];
  categoryName?: string | null;
  images: { id: string; url: string; alt: string | null; sortOrder: number }[];
  variants: {
    id: string;
    sku: string;
    sizeLabel: string | null;
    ageLabel: string | null;
    color: string | null;
    priceCents: number;
    compareAtPriceCents: number | null;
    stockQuantity: number;
    weightGrams: number | null;
    isActive: boolean;
  }[];
}

export function buildProductPreview(
  product: AdminProductDetail | null,
  input: ProductPreviewInput,
): ProductDetail {
  const activeVariants = input.variants.filter((v) => v.isActive);
  const minPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => v.priceCents))
      : 0;
  const compareAt = activeVariants
    .map((v) => v.compareAtPriceCents)
    .filter((p): p is number => p != null);
  const sortedImages = [...input.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = sortedImages[0];

  return {
    id: product?.id ?? "preview",
    slug: input.slug,
    name: input.name || "Nom du produit",
    shortDescription: input.shortDescription ?? null,
    description: input.description ?? null,
    minPriceCents: minPrice,
    compareAtPriceCents: compareAt.length > 0 ? Math.max(...compareAt) : null,
    primaryImageUrl: primary?.url ?? null,
    primaryImageAlt: primary?.alt ?? null,
    categorySlug: null,
    categoryName: input.categoryName ?? null,
    categoryId: product?.categoryId ?? null,
    season: input.season ?? null,
    material: input.material ?? null,
    sizes: [
      ...new Set(activeVariants.map((v) => v.sizeLabel).filter(Boolean)),
    ] as string[],
    ageLabels: [
      ...new Set(activeVariants.map((v) => v.ageLabel).filter(Boolean)),
    ] as string[],
    totalStock: activeVariants.reduce((s, v) => s + v.stockQuantity, 0),
    badges: [],
    createdAt: product?.id ? new Date().toISOString() : new Date().toISOString(),
    brandLabel: input.brandLabel?.trim() || "Sans marque",
    madeIn: input.madeIn ?? null,
    careInstructions: input.careInstructions ?? null,
    gender: input.gender,
    seoTitle: null,
    seoDescription: null,
    images: sortedImages.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
    variants: activeVariants.map((v) => ({
      id: v.id,
      sku: v.sku,
      sizeLabel: v.sizeLabel,
      ageLabel: v.ageLabel,
      color: v.color,
      priceCents: v.priceCents,
      compareAtPriceCents: v.compareAtPriceCents,
      stockQuantity: v.stockQuantity,
      weightGrams: v.weightGrams,
      isActive: v.isActive,
    })),
  };
}
