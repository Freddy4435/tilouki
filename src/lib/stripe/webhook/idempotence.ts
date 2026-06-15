import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";

function requireAdminForWebhooks(): void {
  if (!isSupabaseAdminConfigured() && process.env.NODE_ENV === "production") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY requis pour traiter les webhooks Stripe.",
    );
  }
}

/**
 * Réserve un événement Stripe (`stripe_webhook_events`) avant traitement.
 * Retourne false si l'événement a déjà été traité (idempotence).
 */
export async function tryBeginStripeWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) {
    requireAdminForWebhooks();
    return true;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("stripe_webhook_events").insert({
    id: eventId,
    event_type: eventType,
  });

  if (error?.code === "23505") {
    return false;
  }

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Libère la réservation si le handler échoue — permet le retry Stripe.
 */
export async function rollbackStripeWebhookEvent(eventId: string): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("stripe_webhook_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw error;
  }
}

/** @deprecated Utiliser tryBeginStripeWebhookEvent. */
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

/** @deprecated Réservation atomique via tryBeginStripeWebhookEvent. */
export async function claimStripeWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<void> {
  const begun = await tryBeginStripeWebhookEvent(eventId, eventType);
  if (!begun) {
    return;
  }
}
