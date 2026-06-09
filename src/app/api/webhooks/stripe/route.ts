import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient, isStripeWebhookConfigured } from "@/lib/stripe";
import { logStripeWebhook } from "@/lib/stripe/webhook/logger";
import { processStripeWebhookEvent } from "@/lib/stripe/webhook/process-event";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured()) {
    logStripeWebhook("error", "STRIPE_WEBHOOK_SECRET absent");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    logStripeWebhook("warn", "Requête sans signature Stripe");
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const body = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    logStripeWebhook("error", "Signature Stripe invalide", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  try {
    await processStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    logStripeWebhook("error", "Échec traitement webhook", {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Échec du traitement." }, { status: 500 });
  }
}
