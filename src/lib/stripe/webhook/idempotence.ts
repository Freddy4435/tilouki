import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";

function requireAdminForWebhooks(): void {
  if (!isSupabaseAdminConfigured() && process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY requis pour traiter les webhooks Stripe.");
  }
}

/**
 * Vérifie si un événement Stripe a déjà été traité avec succès.
 */
export async function isStripeWebhookEventProcessed(eventId: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) {
    requireAdminForWebhooks();
    return false;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

/**
 * Enregistre un événement Stripe traité avec succès (après exécution du handler).
 */
export async function claimStripeWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    requireAdminForWebhooks();
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("stripe_webhook_events").insert({
    id: eventId,
    event_type: eventType,
  });

  if (error && error.code !== "23505") {
    throw error;
  }
}
