"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { generateVariantSku } from "@/lib/admin/sku";
import {
  formatPublishBlockMessage,
  getProductReadinessIssues,
  isReadyToPublish,
  mapImagesToReadiness,
  mapVariantsToReadiness,
} from "@/lib/admin/product-readiness";
import { DEV_SEED_PRODUCT_SLUGS } from "@/lib/catalog/dev-seed.fixture";
import { CACHE_TAGS } from "@/lib/supabase/cache";
import {
  getAdminProduct,
  productHasOrders,
  variantHasOrders,
} from "@/lib/supabase/queries/admin/products";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import {
  extractStoragePathFromPublicUrl,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/storage";
import { slugify } from "@/lib/utils/slug";
import {
  adminCreateProductSchema,
  adminProductImageSchema,
  adminUpdateProductSchema,
  adminVariantSchema,
  type AdminCreateProductInput,
  type AdminUpdateProductInput,
  type AdminVariantInput,
} from "@/lib/validations/admin-product";
import { requireAdmin } from "@/server/auth";
import type { ProductStatus } from "@/types/database";

function revalidateProductPaths(productId?: string) {
  revalidateTag(CACHE_TAGS.products, "max");
  revalidatePath("/admin");
  revalidatePath("/admin/produits");
  if (productId) revalidatePath(`/admin/produits/${productId}`);
}

function publishBlockFromVariants(params: {
  slug: string;
  categoryId?: string | null;
  images?: Array<{ url: string; alt?: string | null; sortOrder?: number }>;
  imagesCount?: number;
  variants: AdminVariantInput[];
}): string | null {
  const issues = getProductReadinessIssues({
    slug: params.slug,
    categoryId: params.categoryId,
    images: params.images ? mapImagesToReadiness(params.images) : undefined,
    imagesCount: params.imagesCount,
    variants: mapVariantsToReadiness(
      params.variants.map((variant) => ({
        stockQuantity: variant.stockQuantity,
        weightGrams: variant.weightGrams,
        isActive: variant.isActive,
        priceCents: variant.priceCents,
        sizeLabel: variant.sizeLabel,
        ageLabel: variant.ageLabel,
      })),
    ),
  });

  if (isReadyToPublish(issues)) return null;
  return formatPublishBlockMessage(issues);
}

async function assertProductPublishable(productId: string): Promise<string | null> {
  const product = await getAdminProduct(productId);
  if (!product) return "Produit introuvable.";

  const issues = getProductReadinessIssues({
    slug: product.slug,
    categoryId: product.categoryId,
    images: mapImagesToReadiness(product.images),
    variants: mapVariantsToReadiness(product.variants),
  });

  if (isReadyToPublish(issues)) return null;
  return formatPublishBlockMessage(issues);
}

function mapProductPayload(input: AdminCreateProductInput | AdminUpdateProductInput) {
  return {
    name: input.name.trim(),
    slug: slugify(input.slug || input.name),
    short_description: input.shortDescription?.trim() || null,
    description: input.description?.trim() || null,
    material: input.material?.trim() || null,
    season: input.season?.trim() || null,
    brand_label: input.brandLabel?.trim() || "Sans marque",
    made_in: input.madeIn?.trim() || null,
    care_instructions: input.careInstructions?.trim() || null,
    gender: input.gender,
    status: input.status,
    category_id: input.categoryId?.trim() ? input.categoryId : null,
    seo_title: input.seoTitle?.trim() || null,
    seo_description: input.seoDescription?.trim() || null,
  };
}

function mapVariantPayload(variant: AdminVariantInput, sku: string) {
  return {
    sku,
    size_label: variant.sizeLabel?.trim() || null,
    age_label: variant.ageLabel?.trim() || null,
    color: variant.color?.trim() || null,
    price_cents: variant.priceCents,
    compare_at_price_cents: variant.compareAtPriceCents,
    cost_cents: variant.costCents,
    stock_quantity: variant.stockQuantity,
    weight_grams: variant.weightGrams,
    is_active: variant.isActive,
  };
}

export async function createProductAction(
  input: unknown,
): Promise<{ error?: string; id?: string }> {
  await requireAdmin();
  const parsed = adminCreateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const data = parsed.data;
  const productPayload = mapProductPayload(data);
  const slug = productPayload.slug;

  if (data.status === "active") {
    const block = publishBlockFromVariants({
      slug,
      categoryId: data.categoryId,
      imagesCount: 0,
      variants: data.initialVariants,
    });
    if (block) return { error: block };
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert(productPayload)
    .select("id, slug")
    .single();

  if (error || !product) return { error: error?.message ?? "Création impossible." };

  const existingSkus: string[] = [];
  for (const variant of data.initialVariants) {
    const sku =
      variant.sku?.trim() ||
      generateVariantSku(product.slug, existingSkus, {
        sizeLabel: variant.sizeLabel,
        ageLabel: variant.ageLabel,
        color: variant.color,
      });
    existingSkus.push(sku);

    const { error: variantError } = await supabase.from("product_variants").insert({
      product_id: product.id,
      ...mapVariantPayload(variant, sku),
    });

    if (variantError) {
      await supabase.from("products").delete().eq("id", product.id);
      return { error: variantError.message };
    }
  }

  revalidateProductPaths(product.id);
  return { id: product.id };
}

export async function updateProductAction(
  input: unknown,
): Promise<{ error?: string; id?: string }> {
  await requireAdmin();
  const parsed = adminUpdateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  if (parsed.data.status === "active") {
    const block = await assertProductPublishable(parsed.data.id);
    if (block) return { error: block };
  }

  const { error } = await supabase
    .from("products")
    .update(mapProductPayload(parsed.data))
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };

  revalidateProductPaths(parsed.data.id);
  return { id: parsed.data.id };
}

export async function setProductStatusAction(
  productId: string,
  status: ProductStatus,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  if (status === "active") {
    const block = await assertProductPublishable(productId);
    if (block) return { error: block };
  }

  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", productId);
  if (error) return { error: error.message };

  revalidateProductPaths(productId);
  return {};
}

export async function deleteProductAction(
  productId: string,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (await productHasOrders(productId)) {
    return {
      error:
        "Ce produit est lié à des commandes. Archivez-le plutôt que de le supprimer.",
    };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const product = await getAdminProduct(productId);
  if (!product) return { error: "Produit introuvable." };

  for (const image of product.images) {
    const path = extractStoragePathFromPublicUrl(image.url);
    if (path) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };

  revalidateProductPaths();
  return {};
}

export async function saveVariantAction(
  productId: string,
  input: unknown,
): Promise<{ error?: string; id?: string }> {
  await requireAdmin();
  const parsed = adminVariantSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Variante invalide." };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const product = await getAdminProduct(productId);
  if (!product) return { error: "Produit introuvable." };

  const variant = parsed.data;
  const existingSkus = product.variants
    .filter((v) => v.id !== variant.id)
    .map((v) => v.sku);
  const sku =
    variant.sku?.trim() ||
    generateVariantSku(product.slug, existingSkus, {
      sizeLabel: variant.sizeLabel,
      ageLabel: variant.ageLabel,
      color: variant.color,
    });
  const payload = mapVariantPayload(variant, sku);

  if (variant.id) {
    const { error } = await supabase
      .from("product_variants")
      .update(payload)
      .eq("id", variant.id)
      .eq("product_id", productId);
    if (error) return { error: error.message };
    revalidateProductPaths(productId);
    return { id: variant.id };
  }

  const { data, error } = await supabase
    .from("product_variants")
    .insert({ product_id: productId, ...payload })
    .select("id")
    .single();

  if (error || !data)
    return { error: error?.message ?? "Création variante impossible." };

  revalidateProductPaths(productId);
  return { id: data.id };
}

export async function deleteVariantAction(
  productId: string,
  variantId: string,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (await variantHasOrders(variantId)) {
    return {
      error: "Cette variante est liée à des commandes. Désactivez-la plutôt.",
    };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const product = await getAdminProduct(productId);
  if (!product) return { error: "Produit introuvable." };
  if (product.variants.length <= 1) {
    return { error: "Un produit doit avoir au moins une variante." };
  }

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("product_id", productId);

  if (error) return { error: error.message };

  revalidateProductPaths(productId);
  return {};
}

export async function saveProductImageAction(
  productId: string,
  input: unknown,
): Promise<{ error?: string; id?: string }> {
  await requireAdmin();
  const parsed = adminProductImageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Image invalide." };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const image = parsed.data;

  if (image.id) {
    const { error } = await supabase
      .from("product_images")
      .update({ alt: image.alt?.trim() || null, sort_order: image.sortOrder })
      .eq("id", image.id)
      .eq("product_id", productId);
    if (error) return { error: error.message };
    revalidateProductPaths(productId);
    return { id: image.id };
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url: image.url,
      alt: image.alt?.trim() || null,
      sort_order: image.sortOrder,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Ajout image impossible." };

  revalidateProductPaths(productId);
  return { id: data.id };
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const { data: image } = await supabase
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .eq("product_id", productId)
    .maybeSingle();

  if (!image) return { error: "Image introuvable." };

  const path = extractStoragePathFromPublicUrl(image.url);
  if (path) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) return { error: error.message };

  revalidateProductPaths(productId);
  return {};
}

export async function bulkSaveVariantsAction(
  productId: string,
  input: unknown,
): Promise<{ error?: string; created?: number }> {
  await requireAdmin();

  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Aucune variante à créer." };
  }

  if (input.length > 30) {
    return { error: "Maximum 30 variantes par lot." };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const product = await getAdminProduct(productId);
  if (!product) return { error: "Produit introuvable." };

  const existingSkus = product.variants.map((v) => v.sku);
  let created = 0;

  for (const raw of input) {
    const parsed = adminVariantSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Variante invalide." };
    }

    const variant = parsed.data;
    const sku =
      variant.sku?.trim() ||
      generateVariantSku(product.slug, existingSkus, {
        sizeLabel: variant.sizeLabel,
        ageLabel: variant.ageLabel,
        color: variant.color,
      });
    existingSkus.push(sku);

    const { error } = await supabase.from("product_variants").insert({
      product_id: productId,
      ...mapVariantPayload(variant, sku),
    });

    if (error) return { error: error.message };
    created += 1;
  }

  revalidateProductPaths(productId);
  return { created };
}

export async function reorderProductImagesAction(
  productId: string,
  imageIds: string[],
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const updates = imageIds.map((id, index) =>
    supabase
      .from("product_images")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("product_id", productId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidateProductPaths(productId);
  return {};
}

/** Passe tous les produits de démo seedés en brouillon (sans suppression). */
export async function deactivateAllDemoProductsAction(): Promise<{
  error?: string;
  count?: number;
}> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const { data, error } = await supabase
    .from("products")
    .update({ status: "draft" })
    .in("slug", [...DEV_SEED_PRODUCT_SLUGS])
    .eq("status", "active")
    .select("id");

  if (error) return { error: error.message };

  revalidateProductPaths();
  return { count: data?.length ?? 0 };
}
