import "server-only";

import type { InventoryMovementType } from "@/types/database";

import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";

export interface AdminStockItem {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  sizeLabel: string | null;
  ageLabel: string | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface AdminStockMovement {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: string;
}

const LOW_STOCK_THRESHOLD = 3;

export async function listAdminLowStock(): Promise<AdminStockItem[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("product_variants")
    .select(`*, product:products(id, name)`)
    .eq("is_active", true)
    .lte("stock_quantity", LOW_STOCK_THRESHOLD)
    .order("stock_quantity", { ascending: true });

  return (data ?? []).map((row) => {
    const product = row.product as { id: string; name: string } | null;
    return {
      variantId: row.id,
      productId: product?.id ?? "",
      productName: product?.name ?? "—",
      sku: row.sku,
      sizeLabel: row.size_label,
      ageLabel: row.age_label,
      stockQuantity: row.stock_quantity,
      isActive: row.is_active,
    };
  });
}

export async function listAdminStockMovements(
  limit = 50,
): Promise<AdminStockMovement[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("id, variant_id, type, quantity, note, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!movements?.length) return [];

  const variantIds = [...new Set(movements.map((m) => m.variant_id))];
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, sku, product_id")
    .in("id", variantIds);

  const productIds = [...new Set((variants ?? []).map((v) => v.product_id))];
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);

  const variantMap = new Map((variants ?? []).map((v) => [v.id, v]));
  const productMap = new Map((products ?? []).map((p) => [p.id, p.name]));

  return movements.map((row) => {
    const variant = variantMap.get(row.variant_id);
    const productName = variant ? (productMap.get(variant.product_id) ?? "—") : "—";
    return {
      id: row.id,
      variantId: row.variant_id,
      sku: variant?.sku ?? "—",
      productName,
      type: row.type,
      quantity: row.quantity,
      note: row.note,
      createdAt: row.created_at,
    };
  });
}

export async function findAdminVariantBySku(
  sku: string,
): Promise<AdminStockItem | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;

  const normalized = sku.trim();
  if (!normalized) return null;

  const { data } = await supabase
    .from("product_variants")
    .select(`*, product:products(id, name)`)
    .eq("sku", normalized)
    .maybeSingle();

  if (!data) return null;

  const product = data.product as { id: string; name: string } | null;
  return {
    variantId: data.id,
    productId: product?.id ?? "",
    productName: product?.name ?? "—",
    sku: data.sku,
    sizeLabel: data.size_label,
    ageLabel: data.age_label,
    stockQuantity: data.stock_quantity,
    isActive: data.is_active,
  };
}

export async function adjustAdminVariantStock(input: {
  variantId: string;
  delta: number;
  note: string;
  adminEmail: string;
}): Promise<{ newStockQuantity: number }> {
  const supabase = await getAdminSupabase();
  if (!supabase) {
    throw new Error("Base de données indisponible.");
  }

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id, stock_quantity")
    .eq("id", input.variantId)
    .maybeSingle();

  if (variantError || !variant) {
    throw new Error("Variante introuvable.");
  }

  const movementType: InventoryMovementType =
    input.delta > 0 ? "restock" : "manual_adjustment";

  const { error: insertError } = await supabase.from("inventory_movements").insert({
    variant_id: input.variantId,
    type: movementType,
    quantity: input.delta,
    note: `admin:${input.adminEmail} — ${input.note}`,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { data: updated, error: readError } = await supabase
    .from("product_variants")
    .select("stock_quantity")
    .eq("id", input.variantId)
    .single();

  if (readError || !updated) {
    throw new Error("Impossible de relire le stock après ajustement.");
  }

  return { newStockQuantity: updated.stock_quantity };
}
