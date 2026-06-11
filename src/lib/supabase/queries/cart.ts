import "server-only";

import { computeSubtotalCents } from "@/lib/cart/calculations";
import { computeShippingCents } from "@/lib/shipping/rates";
import { getActiveShippingRates } from "@/lib/supabase/queries/shipping";
import type { CartStockIssue, CartValidationLine, CartValidationResult } from "@/lib/cart/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { assertNoError } from "@/lib/supabase/errors";
import { createPublicClient } from "@/lib/supabase/public";

export interface CartValidationInput {
  variantId: string;
  quantity: number;
}

interface VariantStockRow {
  id: string;
  product_id: string;
  sku: string;
  price_cents: number;
  stock_quantity: number;
  weight_grams: number | null;
  is_active: boolean;
}

function buildIssueMessage(
  issue: CartStockIssue,
  sku: string,
  stockQuantity: number,
  requestedQuantity: number,
): string {
  switch (issue) {
    case "unavailable":
      return `« ${sku} » n'est plus disponible à la vente.`;
    case "out_of_stock":
      return `« ${sku} » est en rupture de stock.`;
    case "insufficient_stock":
      return `Stock insuffisant pour « ${sku} » : ${stockQuantity} disponible(s), ${requestedQuantity} demandé(s).`;
  }
}

export async function validateCartStock(
  lines: CartValidationInput[],
): Promise<CartValidationResult> {
  if (lines.length === 0) {
    return {
      valid: true,
      items: [],
      messages: [],
      subtotalCents: 0,
      shippingCents: 0,
      totalCents: 0,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      valid: false,
      items: [],
      messages: ["La boutique n'est pas encore configurée. Réessayez plus tard."],
      subtotalCents: 0,
      shippingCents: 0,
      totalCents: 0,
    };
  }

  const variantIds = [...new Set(lines.map((line) => line.variantId))];
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("catalog_variants")
    .select("id, product_id, sku, price_cents, stock_quantity, weight_grams, is_active")
    .in("id", variantIds);

  assertNoError(error, "validateCartStock");

  const rows = (data ?? []) as VariantStockRow[];
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const messages: string[] = [];
  const validatedItems: CartValidationLine[] = [];

  const cartItemsForTotals = lines
    .map((line) => {
      const row = rowById.get(line.variantId);
      if (!row) return null;

      const isAvailable = row.is_active;
      const stockQuantity = row.stock_quantity;
      const requestedQuantity = line.quantity;

      let issue: CartStockIssue | undefined;
      let adjustedQuantity = requestedQuantity;

      if (!isAvailable) {
        issue = "unavailable";
        adjustedQuantity = 0;
      } else if (stockQuantity <= 0) {
        issue = "out_of_stock";
        adjustedQuantity = 0;
      } else if (requestedQuantity > stockQuantity) {
        issue = "insufficient_stock";
        adjustedQuantity = stockQuantity;
      }

      if (issue) {
        messages.push(buildIssueMessage(issue, row.sku, stockQuantity, requestedQuantity));
      }

      validatedItems.push({
        variantId: line.variantId,
        stockQuantity,
        unitPriceCents: row.price_cents,
        isAvailable: isAvailable && stockQuantity > 0,
        requestedQuantity,
        adjustedQuantity,
        issue,
      });

      if (adjustedQuantity <= 0) return null;

      return {
        productId: row.product_id,
        variantId: row.id,
        productName: "",
        slug: "",
        image: null,
        sizeLabel: null,
        ageLabel: null,
        sku: row.sku,
        unitPriceCents: row.price_cents,
        quantity: adjustedQuantity,
        stockQuantity,
        weightGrams: row.weight_grams,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const shippingRates = await getActiveShippingRates();
  const subtotalCents = computeSubtotalCents(cartItemsForTotals);
  const shippingCents = computeShippingCents(cartItemsForTotals, shippingRates);
  const totalCents = subtotalCents + shippingCents;

  return {
    valid: messages.length === 0 && cartItemsForTotals.length === lines.length,
    items: validatedItems,
    messages,
    subtotalCents,
    shippingCents,
    totalCents,
  };
}
