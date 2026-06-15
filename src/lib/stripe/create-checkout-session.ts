import "server-only";

import type Stripe from "stripe";

import {
  DEV_SEED_CHECKOUT_BLOCKED_MESSAGE,
  findStorefrontBlockedSlugInCheckoutItems,
} from "@/lib/catalog/dev-seed-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupabaseDataError } from "@/lib/supabase/errors";
import { validateCartStock } from "@/lib/supabase/queries/cart";
import {
  createPendingOrder,
  markOrderPaymentFailed,
  updateOrderStripeSession,
} from "@/lib/supabase/queries/orders";
import {
  isCheckoutLegalReady,
  LEGAL_PUBLICATION_BLOCK_MESSAGE,
} from "@/lib/legal/publication";
import { logSecure } from "@/lib/security/log";
import { getShopSettings } from "@/lib/supabase/queries/shop";
import { getStripeClient } from "@/lib/stripe/client";
import {
  getCheckoutCancelUrl,
  getCheckoutSuccessUrl,
  STRIPE_CURRENCY,
} from "@/lib/stripe/config";
import { StripeCheckoutError } from "@/lib/stripe/errors";
import {
  getShippingConfigurationError,
  isShippingConfiguredForCheckout,
} from "@/lib/shipping/checkout";
import {
  RELAY_VALIDATION_UNAVAILABLE_MESSAGE,
  validateRelayPointDetailed,
} from "@/lib/shipping/validate-relay";
import { buildStripeCheckoutLineItems } from "@/lib/stripe/line-items";
import type {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
} from "@/lib/stripe/types";
import type { CreatedOrder } from "@/types/catalog";
import type { Database } from "@/types/database";

type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

async function fetchOrderLineItems(orderId: string): Promise<OrderItemRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (error) {
    throw new StripeCheckoutError(
      "Impossible de charger les articles de la commande.",
      500,
    );
  }

  return data ?? [];
}

function buildSessionParams(
  order: CreatedOrder,
  customerEmail: string,
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    locale: "fr",
    customer_email: customerEmail,
    line_items: lineItems,
    metadata: {
      order_id: order.id,
      order_number: order.orderNumber,
    },
    payment_intent_data: {
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
      },
    },
    success_url: getCheckoutSuccessUrl(),
    cancel_url: getCheckoutCancelUrl(),
  };
}

/**
 * Crée une commande `pending` puis une session Stripe Checkout hébergée.
 * Prix et stock vérifiés côté serveur via Supabase — jamais depuis le client.
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CreateCheckoutSessionResult> {
  const stockValidation = await validateCartStock(input.items);

  if (!stockValidation.valid) {
    throw new StripeCheckoutError("Stock insuffisant pour finaliser la commande.");
  }

  const blockedSlug = await findStorefrontBlockedSlugInCheckoutItems(input.items);
  if (blockedSlug) {
    throw new StripeCheckoutError(DEV_SEED_CHECKOUT_BLOCKED_MESSAGE, 400, true);
  }

  if (process.env.NODE_ENV === "production") {
    const shopSettings = await getShopSettings();
    if (!(await isCheckoutLegalReady(shopSettings))) {
      throw new StripeCheckoutError(LEGAL_PUBLICATION_BLOCK_MESSAGE, 503, true);
    }
  }

  const carrier = input.carrier ?? "mondial_relay";

  if (!isShippingConfiguredForCheckout(carrier)) {
    throw new StripeCheckoutError(getShippingConfigurationError(carrier), 503);
  }

  const relayValidation = await validateRelayPointDetailed(input.relayPoint, carrier);
  if (!relayValidation.valid) {
    if (relayValidation.unavailable) {
      // Indisponibilité passagère du service de vérification : message exposable.
      throw new StripeCheckoutError(
        relayValidation.error ?? RELAY_VALIDATION_UNAVAILABLE_MESSAGE,
        503,
        true,
      );
    }
    throw new StripeCheckoutError(
      relayValidation.error ?? "Point relais invalide. Sélectionnez-en un autre.",
    );
  }

  let order: CreatedOrder;

  try {
    order = await createPendingOrder({
      customerEmail: input.customer.email,
      customerFirstName: input.customer.firstName,
      customerLastName: input.customer.lastName,
      customerPhone: input.customer.phone,
      items: input.items,
      relayPoint: input.relayPoint,
      carrier,
      currency: "EUR",
    });
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw new StripeCheckoutError(
        "Impossible de créer la commande. Vérifiez votre panier.",
      );
    }
    throw error;
  }

  if (order.currency.toUpperCase() !== "EUR") {
    throw new StripeCheckoutError("Seule la devise EUR est supportée.", 500);
  }

  const orderItems = await fetchOrderLineItems(order.id);
  const lineItems = buildStripeCheckoutLineItems({
    orderItems,
    shippingCents: order.shippingCents,
    discountCents: order.discountCents,
    expectedTotalCents: order.totalCents,
  });

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(
      buildSessionParams(order, input.customer.email, lineItems),
    );

    if (!session.url) {
      throw new StripeCheckoutError("Stripe n'a pas renvoyé d'URL de paiement.", 500);
    }

    await updateOrderStripeSession(order.id, session.id);

    return {
      url: session.url,
      orderId: order.id,
      sessionId: session.id,
    };
  } catch (error) {
    try {
      await markOrderPaymentFailed(order.id);
    } catch {
      // La commande restera pending ; le cron expirePendingOrders libérera le stock.
    }

    logSecure("error", "stripe-checkout: échec création session", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof StripeCheckoutError) throw error;
    throw new StripeCheckoutError("Impossible de créer la session de paiement.", 500);
  }
}

export { STRIPE_CURRENCY };
