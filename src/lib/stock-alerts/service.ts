import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { logSecure } from "@/lib/security/log";
import type { StockAlertSubscribeInput } from "@/lib/validations/stock-alert";

export interface StockAlertSubscribeResult {
  ok: boolean;
  error?: string;
  message?: string;
}

export async function subscribeToStockAlert(
  input: StockAlertSubscribeInput,
): Promise<StockAlertSubscribeResult> {
  const admin = createAdminClient();

  const { data: variant, error: variantError } = await admin
    .from("product_variants")
    .select("id, product_id, stock_quantity, size_label, age_label, is_active")
    .eq("id", input.variantId)
    .maybeSingle();

  if (variantError || !variant) {
    return { ok: false, error: "Cette taille est introuvable." };
  }

  if (!variant.is_active) {
    return { ok: false, error: "Cette taille n'est plus proposée à la vente." };
  }

  if (variant.product_id !== input.productId) {
    return { ok: false, error: "Produit et taille ne correspondent pas." };
  }

  if (variant.stock_quantity > 0) {
    return {
      ok: false,
      error: "Bonne nouvelle : cette taille est de nouveau en stock !",
    };
  }

  const sizeLabel =
    input.sizeLabel?.trim() ||
    variant.size_label?.trim() ||
    variant.age_label?.trim() ||
    null;

  const { data: existing } = await admin
    .from("stock_alerts")
    .select("id, status")
    .eq("email", input.email)
    .eq("variant_id", input.variantId)
    .maybeSingle();

  if (existing?.status === "pending") {
    return {
      ok: true,
      message: "Vous êtes déjà inscrit(e) pour cette taille — nous vous prévenons dès le retour.",
    };
  }

  if (existing) {
    const { error: updateError } = await admin
      .from("stock_alerts")
      .update({
        status: "pending",
        consent_at: new Date().toISOString(),
        product_slug: input.productSlug,
        size_label: sizeLabel,
      })
      .eq("id", existing.id);

    if (updateError) {
      logSecure("error", "Échec réactivation alerte stock", {
        error: updateError.message,
      });
      return { ok: false, error: "Impossible d'enregistrer l'alerte. Réessayez." };
    }
  } else {
    const { error: insertError } = await admin.from("stock_alerts").insert({
      email: input.email,
      product_id: input.productId,
      variant_id: input.variantId,
      product_slug: input.productSlug,
      size_label: sizeLabel,
      consent_at: new Date().toISOString(),
      status: "pending",
    });

    if (insertError) {
      logSecure("error", "Échec insertion alerte stock", { error: insertError.message });
      return { ok: false, error: "Impossible d'enregistrer l'alerte. Réessayez." };
    }
  }

  return {
    ok: true,
    message:
      "Alerte enregistrée — nous vous écrirons dès que cette taille revient en stock.",
  };
}
