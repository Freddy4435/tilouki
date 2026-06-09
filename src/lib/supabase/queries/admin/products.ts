import "server-only";

import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import type { ProductGender, ProductStatus } from "@/types/database";

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  categoryName: string | null;
  minPriceCents: number | null;
  totalStock: number;
  createdAt: string;
}

export interface AdminProductVariant {
  id: string;
  sku: string;
  sizeLabel: string | null;
  ageLabel: string | null;
  color: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  costCents: number | null;
  stockQuantity: number;
  weightGrams: number | null;
  isActive: boolean;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  season: string | null;
  brandLabel: string;
  madeIn: string | null;
  careInstructions: string | null;
  gender: ProductGender;
  status: ProductStatus;
  categoryId: string | null;
  categoryName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  images: { id: string; url: string; alt: string | null; sortOrder: number }[];
  variants: AdminProductVariant[];
  hasOrders: boolean;
}

export async function listAdminProducts(query?: string): Promise<AdminProductListItem[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  let dbQuery = supabase
    .from("products")
    .select(
      `id, name, slug, status, created_at, category:categories(name), variants:product_variants(price_cents, stock_quantity, is_active)`,
    )
    .order("created_at", { ascending: false });

  if (query?.trim()) {
    const term = query.trim();
    dbQuery = dbQuery.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
  }

  const { data } = await dbQuery;

  return (data ?? []).map((row) => {
    const variants = (row.variants ?? []) as {
      price_cents: number;
      stock_quantity: number;
      is_active: boolean;
    }[];
    const activeVariants = variants.filter((v) => v.is_active);
    const minPrice =
      activeVariants.length > 0
        ? Math.min(...activeVariants.map((v) => v.price_cents))
        : null;
    const totalStock = activeVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
    const category = row.category as { name: string } | null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status as ProductStatus,
      categoryName: category?.name ?? null,
      minPriceCents: minPrice,
      totalStock,
      createdAt: row.created_at,
    };
  });
}

export async function productHasOrders(productId: string): Promise<boolean> {
  const supabase = await getAdminSupabase();
  if (!supabase) return false;

  const { count } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  return (count ?? 0) > 0;
}

export async function variantHasOrders(variantId: string): Promise<boolean> {
  const supabase = await getAdminSupabase();
  if (!supabase) return false;

  const { count } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("variant_id", variantId);

  return (count ?? 0) > 0;
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;

  const [productResult, hasOrders] = await Promise.all([
    supabase
      .from("products")
      .select(`*, category:categories(name), images:product_images(*), variants:product_variants(*)`)
      .eq("id", id)
      .maybeSingle(),
    productHasOrders(id),
  ]);

  const data = productResult.data;
  if (!data) return null;

  type VariantRow = {
    id: string;
    sku: string;
    size_label: string | null;
    age_label: string | null;
    color: string | null;
    price_cents: number;
    compare_at_price_cents: number | null;
    cost_cents: number | null;
    stock_quantity: number;
    weight_grams: number | null;
    is_active: boolean;
  };

  type ImageRow = { id: string; url: string; alt: string | null; sort_order: number };
  const category = data.category as { name: string } | null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    shortDescription: data.short_description,
    description: data.description,
    material: data.material,
    season: data.season,
    brandLabel: data.brand_label,
    madeIn: data.made_in,
    careInstructions: data.care_instructions,
    gender: data.gender,
    status: data.status,
    categoryId: data.category_id,
    categoryName: category?.name ?? null,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    hasOrders,
    images: ((data.images ?? []) as ImageRow[])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sort_order,
      })),
    variants: ((data.variants ?? []) as VariantRow[]).map((v) => ({
      id: v.id,
      sku: v.sku,
      sizeLabel: v.size_label,
      ageLabel: v.age_label,
      color: v.color,
      priceCents: v.price_cents,
      compareAtPriceCents: v.compare_at_price_cents,
      costCents: v.cost_cents,
      stockQuantity: v.stock_quantity,
      weightGrams: v.weight_grams,
      isActive: v.is_active,
    })),
  };
}
