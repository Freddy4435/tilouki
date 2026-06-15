"use server";

import { headers } from "next/headers";

import { subscribeToNewsletter } from "@/lib/newsletter/service";
import { checkRateLimit, rateLimitDeniedMessage } from "@/lib/security/rate-limit";
import { newsletterSubscribeSchema } from "@/lib/validations/newsletter";

export async function subscribeNewsletterAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean; message?: string }> {
  if (formData.get("website")) {
    return {
      success: true,
      message: "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.",
    };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  const limit = await checkRateLimit({
    key: `${ip}:newsletter`,
    limit: 5,
    windowSec: 3600,
  });

  if (!limit.allowed) {
    return { error: rateLimitDeniedMessage(limit) };
  }

  const parsed = newsletterSubscribeSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on",
    source: formData.get("source") ?? "footer",
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const result = await subscribeToNewsletter(parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  return { success: true, message: result.message };
}
