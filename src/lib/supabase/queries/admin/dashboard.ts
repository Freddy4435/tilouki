import "server-only";

import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import { formatPrice } from "@/lib/utils";

export interface AdminDashboardStats {
  monthlyRevenueCents: number;
  monthlyRevenueLabel: string;
  monthlyOrderCount: number;
  ordersToPrepare: number;
  lowStockCount: number;
  activeProductCount: number;
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

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await getAdminSupabase();
  const empty: AdminDashboardStats = {
    monthlyRevenueCents: 0,
    monthlyRevenueLabel: formatPrice(0),
    monthlyOrderCount: 0,
    ordersToPrepare: 0,
    lowStockCount: 0,
    activeProductCount: 0,
  };

  if (!supabase) return empty;

  const since = monthStartIso();

  const [paidOrders, toPrepare, lowStock, activeProducts] = await Promise.all([
    supabase
      .from("orders")
      .select("total_cents")
      .eq("payment_status", "paid")
      .gte("created_at", since),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .lte("stock_quantity", 3),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
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
    lowStockCount: lowStock.count ?? 0,
    activeProductCount: activeProducts.count ?? 0,
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
