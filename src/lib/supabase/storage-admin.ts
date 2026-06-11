import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/storage";

export async function isProductImagesStorageConfigured(): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) return false;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage.listBuckets();
    if (error) return false;
    return data?.some((bucket) => bucket.name === PRODUCT_IMAGES_BUCKET) ?? false;
  } catch {
    return false;
  }
}
