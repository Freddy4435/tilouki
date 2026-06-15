import "server-only";

import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import { formatPrice } from "@/lib/utils";

export interface AdminDashboardStats {
  monthlyRevenueCents: number;
  monthlyRevenueLabel: string;
  monthlyOrderCount: number;
  ordersToPrepare: number;
  paidNotShippedCount: number;
  lowStockCount: number;
  activeProductCount: number;
  productsWithoutPhotoCount: number;
  productsWithoutStockCount: number;
  productsWithoutWeightCount: number;
}

export interface AdminRecentProduct {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

export interface AdminRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  createdAt: string;
}

function monthStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

async function getCatalogHealthCounts(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminSupabase>>>,
) {
  const [productsResult, imageRows, variantRows] = await Promise.all([
    supabase.from("products").select("id, status").neq("status", "archived"),
    supabase.from("product_images").select("product_id"),
    supabase
      .from("product_variants")
      .select("product_id, stock_quantity, weight_grams, is_active")
      .eq("is_active", true),
  ]);

  const products = productsResult.data ?? [];
  const activeProductIds = new Set(
    products.filter((p) => p.status === "active").map((p) => p.id),
  );
  const withImages = new Set((imageRows.data ?? []).map((row) => row.product_id));

  const stockByProduct = new Map<string, number>();
  const weightIssueProducts = new Set<string>();

  for (const variant of variantRows.data ?? []) {
    if (!activeProductIds.has(variant.product_id)) continue;

    stockByProduct.set(
      variant.product_id,
      (stockByProduct.get(variant.product_id) ?? 0) + variant.stock_quantity,
    );

    if (!variant.weight_grams || variant.weight_grams <= 0) {
      weightIssueProducts.add(variant.product_id);
    }
  }

  let productsWithoutPhotoCount = 0;
  let productsWithoutStockCount = 0;

  for (const product of products) {
    if (!withImages.has(product.id)) {
      productsWithoutPhotoCount += 1;
    }
  }

  for (const productId of activeProductIds) {
    if ((stockByProduct.get(productId) ?? 0) <= 0) {
      productsWithoutStockCount += 1;
    }
  }

  return {
    productsWithoutPhotoCount,
    productsWithoutStockCount,
    productsWithoutWeightCount: weightIssueProducts.size,
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await getAdminSupabase();
  const empty: AdminDashboardStats = {
    monthlyRevenueCents: 0,
    monthlyRevenueLabel: formatPrice(0),
    monthlyOrderCount: 0,
    ordersToPrepare: 0,
    paidNotShippedCount: 0,
    lowStockCount: 0,
    activeProductCount: 0,
    productsWithoutPhotoCount: 0,
    productsWithoutStockCount: 0,
    productsWithoutWeightCount: 0,
  };

  if (!supabase) return empty;

  const since = monthStartIso();

  const [
    paidOrders,
    toPrepare,
    paidNotShipped,
    lowStock,
    activeProducts,
    catalogHealth,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total_cents")
      .eq("payment_status", "paid")
      .gte("created_at", since),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid")
      .in("status", ["paid", "preparing"]),
    supabase
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .lte("stock_quantity", 3),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    getCatalogHealthCounts(supabase),
  ]);

  const monthlyRevenueCents = (paidOrders.data ?? []).reduce(
    (sum, row) => sum + row.total_cents,
    0,
  );

  return {
    monthlyRevenueCents,
    monthlyRevenueLabel: formatPrice(monthlyRevenueCents),
    monthlyOrderCount: paidOrders.data?.length ?? 0,
    ordersToPrepare: toPrepare.count ?? 0,
    paidNotShippedCount: paidNotShipped.count ?? 0,
    lowStockCount: lowStock.count ?? 0,
    activeProductCount: activeProducts.count ?? 0,
    ...catalogHealth,
  };
}

export async function getAdminRecentProducts(limit = 5): Promise<AdminRecentProduct[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("products")
    .select("id, name, slug, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function getAdminRecentOrders(limit = 5): Promise<AdminRecentOrder[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_first_name, customer_last_name, status, payment_status, total_cents, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: `${row.customer_first_name} ${row.customer_last_name}`.trim(),
    status: row.status,
    paymentStatus: row.payment_status,
    totalCents: row.total_cents,
    createdAt: row.created_at,
  }));
}
