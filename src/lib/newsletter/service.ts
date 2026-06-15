import "server-only";

import { renderNewsletterConfirmationEmail } from "@/lib/email/templates/newsletter-confirmation";
import { sendEmail } from "@/lib/email/send";
import { syncContactToBrevo } from "@/lib/newsletter/brevo";
import {
  generateNewsletterConfirmToken,
  hashNewsletterConfirmToken,
} from "@/lib/newsletter/token";
import type {
  NewsletterConfirmResult,
  NewsletterSubscribeResult,
} from "@/lib/newsletter/types";
import { logSecure } from "@/lib/security/log";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import type { NewsletterSubscribeInput } from "@/lib/validations/newsletter";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

function getShopName(): string {
  return process.env.NEXT_PUBLIC_SHOP_NAME?.trim() || "Tilouki";
}

async function sendConfirmationEmail(email: string, token: string): Promise<void> {
  const siteUrl = getSiteUrl();
  const confirmUrl = `${siteUrl}/newsletter/confirmer?token=${encodeURIComponent(token)}`;
  const rendered = renderNewsletterConfirmationEmail({
    shopName: getShopName(),
    siteUrl,
    confirmUrl,
  });

  await sendEmail({
    to: email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewTag: "newsletter-confirmation",
  });
}

export async function subscribeToNewsletter(
  input: NewsletterSubscribeInput,
): Promise<NewsletterSubscribeResult> {
  if (input.website) {
    return {
      ok: true,
      message: "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.",
    };
  }

  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: "Service temporairement indisponible." };
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { token, hash } = generateNewsletterConfirmToken();

  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", input.email)
    .maybeSingle();

  if (existing?.status === "confirmed") {
    return {
      ok: true,
      message: "Cette adresse est déjà inscrite à la newsletter.",
    };
  }

  if (existing) {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        consent_at: now,
        source: input.source,
        status: "pending",
        confirm_token_hash: hash,
        confirmed_at: null,
        updated_at: now,
      })
      .eq("id", existing.id);

    if (error) {
      logSecure("error", "Échec mise à jour inscription newsletter", {
        error: error.message,
      });
      return { ok: false, error: "Impossible d'enregistrer votre inscription." };
    }
  } else {
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: input.email,
      consent_at: now,
      source: input.source,
      status: "pending",
      confirm_token_hash: hash,
    });

    if (error) {
      if (error.code === "23505") {
        return {
          ok: true,
          message:
            "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.",
        };
      }
      logSecure("error", "Échec insertion newsletter", { error: error.message });
      return { ok: false, error: "Impossible d'enregistrer votre inscription." };
    }
  }

  try {
    await sendConfirmationEmail(input.email, token);
  } catch (error) {
    logSecure("error", "Échec envoi e-mail confirmation newsletter", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      error:
        "Inscription enregistrée mais l'e-mail de confirmation n'a pas pu être envoyé.",
    };
  }

  return {
    ok: true,
    message: "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.",
  };
}

export async function confirmNewsletterSubscription(
  token: string,
): Promise<NewsletterConfirmResult> {
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: "Service temporairement indisponible." };
  }

  const hash = hashNewsletterConfirmToken(token);
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, status")
    .eq("confirm_token_hash", hash)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Lien de confirmation invalide ou expiré." };
  }

  if (data.status === "confirmed") {
    return { ok: true, message: "Votre inscription est déjà confirmée." };
  }

  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      status: "confirmed",
      confirmed_at: now,
      confirm_token_hash: null,
      updated_at: now,
    })
    .eq("id", data.id);

  if (updateError) {
    logSecure("error", "Échec confirmation newsletter", { error: updateError.message });
    return { ok: false, error: "Impossible de confirmer votre inscription." };
  }

  await syncContactToBrevo(data.email);

  return {
    ok: true,
    message: "Votre inscription à la newsletter est confirmée. À très bientôt !",
  };
}
