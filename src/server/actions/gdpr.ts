"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { getEmailConfig } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send";
import { logSecure } from "@/lib/security/log";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { anonymizeCustomerByEmail } from "@/lib/supabase/queries/orders";
import { requireAdmin } from "@/server/auth";

const dataRequestSchema = z.object({
  email: z.string().email("Adresse e-mail invalide."),
  requestType: z.enum(["access", "deletion"]),
  message: z.string().max(2000).optional(),
});

export async function submitDataRequestAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  if (formData.get("website")) {
    return { success: true };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  const limit = await checkRateLimit({
    key: `${ip}:gdpr-request`,
    limit: 3,
    windowSec: 3600,
  });

  if (!limit.allowed) {
    return { error: "Trop de demandes. Réessayez plus tard." };
  }

  const parsed = dataRequestSchema.safeParse({
    email: formData.get("email"),
    requestType: formData.get("requestType"),
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  logSecure("info", "Demande RGPD client", {
    requestType: parsed.data.requestType,
    email: parsed.data.email,
  });

  const config = getEmailConfig();
  if (config.adminEmail) {
    const typeLabel =
      parsed.data.requestType === "access" ? "Accès aux données" : "Suppression / anonymisation";

    try {
      await sendEmail({
        to: config.adminEmail,
        subject: `[RGPD] ${typeLabel}`,
        html: `<p>Nouvelle demande RGPD depuis le site.</p>
<ul>
<li><strong>Type :</strong> ${typeLabel}</li>
<li><strong>E-mail :</strong> ${parsed.data.email}</li>
<li><strong>Message :</strong> ${parsed.data.message ?? "—"}</li>
</ul>
<p>Répondre sous 30 jours conformément au RGPD.</p>`,
        text: `Demande RGPD — ${typeLabel}\nE-mail: ${parsed.data.email}\nMessage: ${parsed.data.message ?? "—"}`,
      });
    } catch (error) {
      logSecure("error", "Notification admin RGPD non envoyée", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    success: true,
  };
}

export async function anonymizeCustomerDataAction(
  email: string,
): Promise<{ error?: string; count?: number }> {
  await requireAdmin();

  const parsed = z.string().email().safeParse(email.trim());
  if (!parsed.success) {
    return { error: "E-mail invalide." };
  }

  try {
    const count = await anonymizeCustomerByEmail(parsed.data);
    return { count };
  } catch {
    return { error: "Anonymisation impossible." };
  }
}
