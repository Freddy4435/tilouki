"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { executeProductImport, previewProductImport } from "@/lib/admin/product-import";
import { CACHE_TAGS } from "@/lib/supabase/cache";
import type {
  ImportExecuteResult,
  ImportPreviewResult,
} from "@/lib/validations/product-import";
import { requireAdmin } from "@/server/auth";

const MAX_CSV_BYTES = 2 * 1024 * 1024;

export async function previewProductImportAction(
  csvContent: string,
): Promise<{ error?: string; preview?: ImportPreviewResult }> {
  await requireAdmin();

  if (!csvContent?.trim()) {
    return { error: "Fichier CSV vide." };
  }

  if (new TextEncoder().encode(csvContent).byteLength > MAX_CSV_BYTES) {
    return { error: "Fichier trop volumineux (max 2 Mo)." };
  }

  const preview = await previewProductImport(csvContent);
  return { preview };
}

export async function executeProductImportAction(
  csvContent: string,
): Promise<{ error?: string; result?: ImportExecuteResult }> {
  await requireAdmin();

  if (!csvContent?.trim()) {
    return { error: "Fichier CSV vide." };
  }

  if (new TextEncoder().encode(csvContent).byteLength > MAX_CSV_BYTES) {
    return { error: "Fichier trop volumineux (max 2 Mo)." };
  }

  const preview = await previewProductImport(csvContent);
  if (preview.headerError) {
    return { error: preview.headerError };
  }

  if (preview.summary.valid === 0) {
    return { error: "Aucune ligne valide à importer." };
  }

  const result = await executeProductImport(csvContent);

  revalidateTag(CACHE_TAGS.products, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidatePath("/admin/produits");
  revalidatePath("/admin/import");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/stock");

  return { result };
}
