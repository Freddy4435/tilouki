import { pickCartComplementProducts } from "@/lib/cart/cart-complement";
import { getActiveProducts } from "@/lib/supabase/queries/products";

const POOL_LIMIT = 64;

export async function getCartComplementProducts(cartSlugs: string[]) {
  const normalized = cartSlugs.map((slug) => slug.trim()).filter(Boolean);
  if (normalized.length === 0) return [];

  const pool = await getActiveProducts({ limit: POOL_LIMIT });
  return pickCartComplementProducts(normalized, pool, 4);
}
