"use server";

import { headers } from "next/headers";

import { subscribeToStockAlert } from "@/lib/stock-alerts/service";
import { checkRateLimit, rateLimitDeniedMessage } from "@/lib/security/rate-limit";
import { stockAlertSubscribeSchema } from "@/lib/validations/stock-alert";

export async function subscribeStockAlertAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean; message?: string }> {
  if (formData.get("website")) {
    return {
      success: true,
      message: "Alerte enregistrée — nous vous écrirons dès que cette taille revient en stock.",
    };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  const limit = await checkRateLimit({
    key: `${ip}:stock-alert`,
    limit: 8,
    windowSec: 3600,
  });

  if (!limit.allowed) {
    return { error: rateLimitDeniedMessage(limit) };
  }

  const parsed = stockAlertSubscribeSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on",
    productId: formData.get("productId"),
    variantId: formData.get("variantId"),
    productSlug: formData.get("productSlug"),
    sizeLabel: formData.get("sizeLabel") || null,
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const result = await subscribeToStockAlert(parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  return { success: true, message: result.message };
}
