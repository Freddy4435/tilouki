import type { ProductBadgeType } from "@/components/product/product-badges";
import type {
  Category,
  ProductDetail,
  ProductImage,
  ProductListItem,
  ProductVariant,
} from "@/types/catalog";
import type { Database } from "@/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type VariantRow = Database["public"]["Tables"]["product_variants"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type ProductWithRelations = ProductRow & {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  images: ImageRow[];
  variants: VariantRow[];
};

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  };
}

export function mapProductImage(row: ImageRow): ProductImage {
  return {
    id: row.id,
    url: row.url,
    alt: row.alt,
    sortOrder: row.sort_order,
  };
}

export function mapProductVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    sku: row.sku,
    sizeLabel: row.size_label,
    ageLabel: row.age_label,
    color: row.color,
    priceCents: row.price_cents,
    compareAtPriceCents: row.compare_at_price_cents,
    stockQuantity: row.stock_quantity,
    weightGrams: row.weight_grams,
    isActive: row.is_active,
  };
}

export function deriveProductBadges(
  product: Pick<ProductRow, "material" | "season">,
  variants: VariantRow[],
): ProductBadgeType[] {
  const badges: ProductBadgeType[] = [];
  const activeVariants = variants.filter((v) => v.is_active);
  const totalStock = activeVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
  const minPrice = activeVariants.length
    ? Math.min(...activeVariants.map((v) => v.price_cents))
    : null;
  const hasComparePrice = activeVariants.some(
    (v) => v.compare_at_price_cents != null && v.compare_at_price_cents > v.price_cents,
  );

  if (totalStock === 1) badges.push("last-piece");
  if (hasComparePrice || (minPrice !== null && minPrice < 1500)) badges.push("low-price");

  const material = product.material?.toLowerCase() ?? "";
  if (material.includes("coton")) badges.push("cotton");

  const season = product.season?.toLowerCase() ?? "";
  if (season.includes("printemps") || season.includes("été") || season.includes("ete")) {
    badges.push("spring-summer");
  } else if (season.includes("automne") || season.includes("hiver")) {
    badges.push("autumn-winter");
  } else if (season.includes("toute")) {
    badges.push("all-season");
  }

  return badges;
}

export function mapProductListItem(row: ProductWithRelations): ProductListItem {
  const activeVariants = row.variants.filter((v) => v.is_active);
  const sortedImages = [...row.images].sort((a, b) => a.sort_order - b.sort_order);
  const primaryImage = sortedImages[0] ?? null;

  const prices = activeVariants.map((v) => v.price_cents);
  const comparePrices = activeVariants
    .map((v) => v.compare_at_price_cents)
    .filter((p): p is number => p != null);

  const minPriceCents = prices.length ? Math.min(...prices) : 0;
  const compareAtPriceCents = comparePrices.length ? Math.max(...comparePrices) : null;

  const sizes = [
    ...new Set(
      activeVariants.map((v) => v.size_label).filter((s): s is string => Boolean(s)),
    ),
  ];
  const ageLabels = [
    ...new Set(
      activeVariants.map((v) => v.age_label).filter((a): a is string => Boolean(a)),
    ),
  ];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    minPriceCents,
    compareAtPriceCents,
    primaryImageUrl: primaryImage?.url ?? null,
    primaryImageAlt: primaryImage?.alt ?? row.name,
    categorySlug: row.category?.slug ?? null,
    categoryName: row.category?.name ?? null,
    season: row.season,
    material: row.material,
    sizes,
    ageLabels,
    totalStock: activeVariants.reduce((sum, v) => sum + v.stock_quantity, 0),
    badges: deriveProductBadges(row, row.variants),
    createdAt: row.created_at,
  };
}

export function mapProductDetail(row: ProductWithRelations): ProductDetail {
  const listItem = mapProductListItem(row);
  const sortedImages = [...row.images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapProductImage);
  const variants = row.variants
    .filter((v) => v.is_active)
    .map(mapProductVariant);

  return {
    ...listItem,
    description: row.description,
    brandLabel: row.brand_label,
    madeIn: row.made_in,
    careInstructions: row.care_instructions,
    gender: row.gender,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    categoryId: row.category_id,
    images: sortedImages,
    variants,
  };
}
