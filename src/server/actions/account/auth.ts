"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { siteConfig } from "@/lib/constants/site";
import { checkRateLimit, rateLimitDeniedMessage } from "@/lib/security/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { customerMagicLinkSchema } from "@/lib/validations/account";

export interface CustomerAuthActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function requestCustomerMagicLinkAction(
  _prev: CustomerAuthActionResult,
  formData: FormData,
): Promise<CustomerAuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Connexion indisponible pour le moment." };
  }

  const parsed = customerMagicLinkSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "E-mail invalide." };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  const limit = await checkRateLimit({
    key: `${ip}:customer-magic-link`,
    limit: 6,
    windowSec: 3600,
  });

  if (!limit.allowed) {
    return { error: rateLimitDeniedMessage(limit) };
  }

  const supabase = await createClient();
  const redirectTo = `${siteConfig.url.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent("/compte")}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: "Impossible d'envoyer le lien. Réessayez dans quelques minutes." };
  }

  return {
    success: true,
    message:
      "Un lien de connexion vient de vous être envoyé. Ouvrez-le sur cet appareil pour synchroniser vos favoris.",
  };
}

export async function customerLogoutAction(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect("/compte");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/compte");
}
