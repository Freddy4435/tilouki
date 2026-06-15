import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS, REVALIDATE, productReviewsTag } from "@/lib/supabase/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertNoError, isMissingSchemaError } from "@/lib/supabase/errors";
import { isSupabaseConfigured } from "@/lib/supabase/env";

async function fetchPaidPurchaseCount(productId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("order_items")
    .select("id, orders!inner(payment_status)", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("orders.payment_status", "paid");

  if (error) {
    if (isMissingSchemaError(error)) return 0;
    assertNoError(error, "countPaidPurchasesForProduct");
  }

  return count ?? 0;
}

export async function countPaidPurchasesForProduct(productId: string): Promise<number> {
  return unstable_cache(
    () => fetchPaidPurchaseCount(productId),
    ["product-paid-purchases", productId],
    {
      tags: [CACHE_TAGS.products, productReviewsTag(productId)],
      revalidate: REVALIDATE.product,
    },
  )();
}
