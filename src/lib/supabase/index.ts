/**
 * Point d'entrée Supabase.
 * Les requêtes données sont server-only — ne pas importer dans les composants client.
 */

export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";
export { createAdminClient } from "./admin";
export { updateSession } from "./middleware";
export { isSupabaseConfigured, isSupabaseAdminConfigured } from "./env";
export { SupabaseDataError } from "./errors";
export { CACHE_TAGS, REVALIDATE, productTag, legalTag } from "./cache";

export {
  getActiveProducts,
  getProductBySlug,
  getRelatedProducts,
  getCategories,
  getShopSettings,
  getLegalPage,
  createPendingOrder,
  createOrderFromCheckout,
  decrementStockOnce,
  markOrderAsPaid,
  updateStockAfterOrder,
} from "./queries";
