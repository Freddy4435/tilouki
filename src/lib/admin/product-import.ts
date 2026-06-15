import "server-only";

import { generateVariantSku } from "@/lib/admin/sku";
import { parseCsvContent, validateCsvHeaders } from "@/lib/admin/csv-parse";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import { slugify } from "@/lib/utils/slug";
import {
  importRowSchema,
  type ImportExecuteResult,
  type ImportPreviewResult,
  type ImportPreviewRow,
} from "@/lib/validations/product-import";

function normalizeReference(reference: string): string {
  return reference.trim().toLowerCase();
}

function variantKey(
  reference: string,
  sizeLabel: string | null,
  color: string | null,
): string {
  const ref = normalizeReference(reference);
  const size = (sizeLabel ?? "").trim().toLowerCase();
  const col = (color ?? "").trim().toLowerCase();
  return `${ref}|${size}|${col}`;
}

function normalizeGender(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (v === "garçon" || v === "garcon") return "garcon";
  if (v === "fille") return "fille";
  if (v === "mixte" || v === "unisexe") return "mixte";
  return v;
}

async function loadExistingVariantKeys(references: string[]): Promise<Set<string>> {
  const supabase = await getAdminSupabase();
  const keys = new Set<string>();
  if (!supabase || references.length === 0) return keys;

  const slugByRef = new Map(
    references.map((ref) => [slugify(ref), normalizeReference(ref)]),
  );
  const slugs = [...slugByRef.keys()];

  const { data: products } = await supabase
    .from("products")
    .select("slug, variants:product_variants(size_label, color)")
    .in("slug", slugs);

  for (const product of products ?? []) {
    const ref = slugByRef.get(product.slug) ?? product.slug;
    const variants = (product.variants ?? []) as {
      size_label: string | null;
      color: string | null;
    }[];
    for (const v of variants) {
      keys.add(variantKey(ref, v.size_label, v.color));
    }
  }

  return keys;
}

function buildPreviewRows(
  csvRows: Record<string, string>[],
  existingKeys: Set<string>,
): ImportPreviewRow[] {
  const batchKeys = new Set<string>();
  const preview: ImportPreviewRow[] = [];

  csvRows.forEach((raw, index) => {
    const lineNumber = index + 2;
    const normalized = {
      ...raw,
      gender: normalizeGender(raw.gender ?? ""),
      cost_eur: raw.cost_eur?.trim() ? raw.cost_eur : undefined,
      weight_grams: raw.weight_grams?.trim() ? raw.weight_grams : undefined,
      image_url: raw.image_url?.trim() ? raw.image_url : undefined,
    };

    const parsed = importRowSchema.safeParse(normalized);
    if (!parsed.success) {
      preview.push({
        lineNumber,
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Ligne invalide.",
      });
      return;
    }

    const data = parsed.data;
    const productSlug = slugify(data.reference);
    const key = variantKey(data.reference, data.size_label ?? null, data.color ?? null);

    if (existingKeys.has(key) || batchKeys.has(key)) {
      preview.push({
        lineNumber,
        status: "duplicate",
        message: "Doublon : cette référence + taille + couleur existe déjà.",
        data,
        productSlug,
        variantKey: key,
      });
      return;
    }

    batchKeys.add(key);
    preview.push({
      lineNumber,
      status: "valid",
      data,
      productSlug,
      variantKey: key,
    });
  });

  return preview;
}

export async function previewProductImport(
  csvContent: string,
): Promise<ImportPreviewResult> {
  const parsed = parseCsvContent(csvContent);
  const headerError = validateCsvHeaders(parsed.headers);

  if (headerError || parsed.rows.length === 0) {
    return {
      headers: parsed.headers,
      separator: parsed.separator,
      rows: [],
      summary: { total: 0, valid: 0, duplicate: 0, error: 0 },
      headerError:
        headerError ?? (parsed.rows.length === 0 ? "Le fichier est vide." : undefined),
    };
  }

  const references = [
    ...new Set(parsed.rows.map((r) => (r.reference ?? "").trim()).filter(Boolean)),
  ];
  const existingKeys = await loadExistingVariantKeys(references);
  const rows = buildPreviewRows(parsed.rows, existingKeys);

  const summary = {
    total: rows.length,
    valid: rows.filter((r) => r.status === "valid").length,
    duplicate: rows.filter((r) => r.status === "duplicate").length,
    error: rows.filter((r) => r.status === "error").length,
  };

  return { headers: parsed.headers, separator: parsed.separator, rows, summary };
}

async function ensureCategory(
  name: string,
  cache: Map<string, string>,
): Promise<{ id: string; created: boolean }> {
  const slug = slugify(name);
  if (cache.has(slug)) {
    return { id: cache.get(slug)!, created: false };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) throw new Error("Base de données indisponible.");

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    cache.set(slug, existing.id);
    return { id: existing.id, created: false };
  }

  const { data: created, error } = await supabase
    .from("categories")
    .insert({ name: name.trim(), slug, is_active: true })
    .select("id")
    .single();

  if (error || !created)
    throw new Error(error?.message ?? "Création catégorie impossible.");

  cache.set(slug, created.id);
  return { id: created.id, created: true };
}

export async function executeProductImport(
  csvContent: string,
): Promise<ImportExecuteResult> {
  const preview = await previewProductImport(csvContent);

  const result: ImportExecuteResult = {
    imported: 0,
    skipped: 0,
    errors: preview.summary.error + preview.summary.duplicate,
    categoriesCreated: 0,
    productsCreated: 0,
    variantsCreated: 0,
    details: [],
  };

  if (preview.headerError) {
    return {
      ...result,
      errors: 1,
      details: [{ lineNumber: 1, status: "error", message: preview.headerError }],
    };
  }

  const validRows = preview.rows.filter((r) => r.status === "valid" && r.data);
  preview.rows
    .filter((r) => r.status !== "valid")
    .forEach((r) => {
      result.details.push({
        lineNumber: r.lineNumber,
        status: r.status === "duplicate" ? "skipped" : "error",
        message: r.message,
      });
      if (r.status === "duplicate") result.skipped += 1;
    });

  if (validRows.length === 0) return result;

  const supabase = await getAdminSupabase();
  if (!supabase) {
    return {
      ...result,
      errors: result.errors + validRows.length,
      details: [
        ...result.details,
        ...validRows.map((r) => ({
          lineNumber: r.lineNumber,
          status: "error" as const,
          message: "Base de données indisponible.",
        })),
      ],
    };
  }

  const categoryCache = new Map<string, string>();
  const productCache = new Map<string, string>();
  const skuCache = new Map<string, string[]>();

  const grouped = new Map<string, ImportPreviewRow[]>();
  for (const row of validRows) {
    const slug = row.productSlug!;
    const list = grouped.get(slug) ?? [];
    list.push(row);
    grouped.set(slug, list);
  }

  for (const [productSlug, rows] of grouped) {
    const first = rows[0].data!;

    try {
      const category = await ensureCategory(first.category, categoryCache);
      if (category.created) result.categoriesCreated += 1;

      let productId = productCache.get(productSlug);
      let productCreated = false;

      if (!productId) {
        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("slug", productSlug)
          .maybeSingle();

        if (existingProduct) {
          productId = existingProduct.id;
        } else {
          const { data: newProduct, error: productError } = await supabase
            .from("products")
            .insert({
              name: first.name.trim(),
              slug: productSlug,
              description: first.description?.trim() || null,
              material: first.material?.trim() || null,
              season: first.season?.trim() || null,
              made_in: first.made_in?.trim() || null,
              gender: first.gender,
              status: "draft",
              brand_label: "Sans marque",
              category_id: category.id,
            })
            .select("id")
            .single();

          if (productError || !newProduct) {
            throw new Error(productError?.message ?? "Création produit impossible.");
          }

          productId = newProduct.id;
          productCreated = true;

          const imageRow = rows.find((r) => r.data?.image_url);
          if (imageRow?.data?.image_url) {
            await supabase.from("product_images").insert({
              product_id: productId,
              url: imageRow.data.image_url,
              alt: first.name,
              sort_order: 0,
            });
          }
        }

        productCache.set(productSlug, productId);
        if (productCreated) result.productsCreated += 1;
      }

      const existingSkus = skuCache.get(productSlug) ?? [];
      const { data: dbSkus } = await supabase
        .from("product_variants")
        .select("sku")
        .eq("product_id", productId);

      const allSkus = [...existingSkus, ...(dbSkus ?? []).map((s) => s.sku)];

      for (const row of rows) {
        const data = row.data!;
        try {
          const sku = generateVariantSku(productSlug, allSkus, {
            sizeLabel: data.size_label,
            ageLabel: data.age_label,
            color: data.color,
          });
          allSkus.push(sku);

          const { error: variantError } = await supabase
            .from("product_variants")
            .insert({
              product_id: productId,
              sku,
              size_label: data.size_label?.trim() || null,
              age_label: data.age_label?.trim() || null,
              color: data.color?.trim() || null,
              price_cents: data.price_cents,
              cost_cents: data.cost_cents,
              stock_quantity: data.stock_quantity,
              weight_grams: data.weight_grams,
              is_active: true,
            });

          if (variantError) throw new Error(variantError.message);

          skuCache.set(productSlug, allSkus);
          result.variantsCreated += 1;
          result.imported += 1;
          result.details.push({ lineNumber: row.lineNumber, status: "imported" });
        } catch (err) {
          result.errors += 1;
          result.details.push({
            lineNumber: row.lineNumber,
            status: "error",
            message: err instanceof Error ? err.message : "Erreur variante.",
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur import.";
      for (const row of rows) {
        result.errors += 1;
        result.details.push({ lineNumber: row.lineNumber, status: "error", message });
      }
    }
  }

  return result;
}
