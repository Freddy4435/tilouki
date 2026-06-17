"use server";

import { revalidatePath } from "next/cache";

import {
  adjustAdminVariantStock,
  findAdminVariantBySku,
} from "@/lib/supabase/queries/admin/stock";
import { adminStockAdjustSchema } from "@/lib/validations/admin-order";
import { requireAdmin } from "@/server/auth";

export async function adjustStockAction(
  input: unknown,
): Promise<{
  error?: string;
  success?: boolean;
  message?: string;
  newStockQuantity?: number;
}> {
  const user = await requireAdmin();
  const parsed = adminStockAdjustSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const result = await adjustAdminVariantStock({
      variantId: parsed.data.variantId,
      delta: parsed.data.delta,
      note: parsed.data.note,
      adminEmail: user.email ?? user.id,
    });

    revalidatePath("/admin/stock");
    revalidatePath(`/admin/produits`);

    return {
      success: true,
      newStockQuantity: result.newStockQuantity,
      message: `Stock mis à jour : ${result.newStockQuantity} unité(s) en stock.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { error: message };
  }
}

export async function lookupVariantBySkuAction(
  sku: string,
): Promise<{ error?: string; variant?: Awaited<ReturnType<typeof findAdminVariantBySku>> }> {
  await requireAdmin();
  const variant = await findAdminVariantBySku(sku);
  if (!variant) {
    return { error: "Aucune variante trouvée pour ce SKU." };
  }
  return { variant };
}
