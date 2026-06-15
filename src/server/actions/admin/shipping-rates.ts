"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { isCarrierConfigured } from "@/lib/shipping/carriers";
import type { CarrierName } from "@/lib/shipping/types";
import { CACHE_TAGS } from "@/lib/supabase/cache";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import { listAdminShippingRatesForProvider } from "@/lib/supabase/queries/admin/shipping-rates";
import {
  adminShippingRateSchema,
  computeReorderUpdates,
  findOverlappingRate,
  mergeRateIntoGrid,
  validateContinuousRateGrid,
  type ReorderDirection,
} from "@/lib/validations/admin-shipping-rate";
import { requireAdmin } from "@/server/auth";

function revalidateShippingRates(): void {
  revalidateTag(CACHE_TAGS.shippingRates, "max");
  revalidatePath("/admin/livraison");
  revalidatePath("/panier");
  revalidatePath("/commande");
  revalidatePath("/api/shipping/rates");
  revalidatePath("/api/shipping/estimate");
}

/**
 * Garde-fou : un transporteur proposé au checkout doit conserver au moins une
 * tranche active, sinon le barème serait silencieusement remplacé par les
 * valeurs par défaut codées en dur.
 */
function guardLastActiveRate(
  provider: CarrierName,
  remainingActiveCount: number,
): string | null {
  if (remainingActiveCount > 0) return null;
  if (!isCarrierConfigured(provider)) return null;
  return "Impossible de désactiver la dernière tranche active : ce transporteur est proposé au checkout et doit conserver au moins une tranche.";
}

export async function saveShippingRateAction(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const parsed = adminShippingRateSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    provider: String(formData.get("provider") ?? ""),
    shippingMethod: String(formData.get("shippingMethod") ?? "relay_point"),
    label: String(formData.get("label") ?? ""),
    minWeightGrams: String(formData.get("minWeightGrams") ?? ""),
    maxWeightGrams: String(formData.get("maxWeightGrams") ?? ""),
    priceCents: String(formData.get("priceEuros") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Saisie invalide." };
  }

  const input = parsed.data;
  const existing = await listAdminShippingRatesForProvider(input.provider);

  if (input.isActive) {
    const conflict = findOverlappingRate(
      {
        id: input.id,
        minWeightGrams: input.minWeightGrams,
        maxWeightGrams: input.maxWeightGrams,
      },
      existing,
    );
    if (conflict) {
      return {
        error: `Cette tranche chevauche « ${conflict.label} » (${conflict.minWeightGrams} – ${conflict.maxWeightGrams} g). Ajustez les bornes.`,
      };
    }

    if (isCarrierConfigured(input.provider)) {
      const merged = mergeRateIntoGrid(existing, {
        id: input.id,
        label: input.label,
        minWeightGrams: input.minWeightGrams,
        maxWeightGrams: input.maxWeightGrams,
        isActive: true,
      });
      const gridError = validateContinuousRateGrid(merged);
      if (gridError) return { error: gridError };
    }
  } else if (input.id) {
    // Désactivation d'une tranche existante via le formulaire d'édition.
    const remainingActive = existing.filter(
      (rate) => rate.isActive && rate.id !== input.id,
    ).length;
    const guard = guardLastActiveRate(input.provider, remainingActive);
    if (guard) return { error: guard };
  }

  const payload = {
    provider: input.provider,
    shipping_method: input.shippingMethod,
    label: input.label,
    min_weight_grams: input.minWeightGrams,
    max_weight_grams: input.maxWeightGrams,
    price_cents: input.priceCents,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };

  const { error } = input.id
    ? await supabase.from("shipping_rates").update(payload).eq("id", input.id)
    : await supabase.from("shipping_rates").insert(payload);

  if (error) return { error: error.message };

  revalidateShippingRates();
  return {};
}

/** Active / désactive une tranche depuis le tableau (pas de suppression physique). */
export async function setShippingRateActiveAction(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "on";
  if (!id) return { error: "Tranche introuvable." };

  const { data: row, error: fetchError } = await supabase
    .from("shipping_rates")
    .select("provider, is_active")
    .eq("id", id)
    .single();

  if (fetchError || !row) return { error: "Tranche introuvable." };

  const provider = row.provider as CarrierName;

  if (!isActive) {
    const existing = await listAdminShippingRatesForProvider(provider);
    const remainingActive = existing.filter(
      (rate) => rate.isActive && rate.id !== id,
    ).length;
    const guard = guardLastActiveRate(provider, remainingActive);
    if (guard) return { error: guard };

    if (isCarrierConfigured(provider)) {
      const remaining = existing.filter((rate) => rate.isActive && rate.id !== id);
      const gridError = validateContinuousRateGrid(remaining);
      if (gridError) return { error: gridError };
    }
  } else {
    // Réactivation : la tranche ne doit pas chevaucher les tranches actives.
    const existing = await listAdminShippingRatesForProvider(provider);
    const self = existing.find((rate) => rate.id === id);
    if (self) {
      const conflict = findOverlappingRate(self, existing);
      if (conflict) {
        return {
          error: `Réactivation impossible : la tranche chevauche « ${conflict.label} » (${conflict.minWeightGrams} – ${conflict.maxWeightGrams} g).`,
        };
      }

      if (isCarrierConfigured(provider)) {
        const merged = mergeRateIntoGrid(existing, { ...self, isActive: true });
        const gridError = validateContinuousRateGrid(merged);
        if (gridError) return { error: gridError };
      }
    }
  }

  const { error } = await supabase
    .from("shipping_rates")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateShippingRates();
  return {};
}

/** Monte ou descend une tranche dans l'ordre d'affichage (échange des sort_order). */
export async function reorderShippingRateAction(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "") as ReorderDirection;
  if (!id) return { error: "Tranche introuvable." };
  if (direction !== "up" && direction !== "down") {
    return { error: "Sens de réordonnancement invalide." };
  }

  const { data: row, error: fetchError } = await supabase
    .from("shipping_rates")
    .select("provider")
    .eq("id", id)
    .single();

  if (fetchError || !row) return { error: "Tranche introuvable." };

  const provider = row.provider as CarrierName;
  const existing = await listAdminShippingRatesForProvider(provider);
  const updates = computeReorderUpdates(existing, id, direction);

  if (!updates) {
    return { error: "Cette tranche est déjà en limite de liste." };
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("shipping_rates")
      .update({ sort_order: update.sortOrder })
      .eq("id", update.id);

    if (error) return { error: error.message };
  }

  revalidateShippingRates();
  return {};
}
