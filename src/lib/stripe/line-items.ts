import "server-only";

import type Stripe from "stripe";

import { STRIPE_CURRENCY } from "@/lib/stripe/config";
import { StripeCheckoutError } from "@/lib/stripe/errors";
import type { Database } from "@/types/database";

type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

interface BuildLineItemsInput {
  orderItems: OrderItemRow[];
  shippingCents: number;
  discountCents: number;
  expectedTotalCents: number;
}

function allocateLineDiscounts(
  orderItems: OrderItemRow[],
  discountCents: number,
): number[] {
  if (discountCents <= 0) {
    return orderItems.map(() => 0);
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price_cents, 0);
  if (subtotal <= 0) {
    throw new StripeCheckoutError("Sous-total invalide pour la remise.");
  }

  let assigned = 0;
  return orderItems.map((item, index) => {
    const lineDiscount =
      index === orderItems.length - 1
        ? discountCents - assigned
        : Math.floor((discountCents * item.total_price_cents) / subtotal);
    assigned += lineDiscount;
    return lineDiscount;
  });
}

function resolveDiscountedUnitAmount(
  item: OrderItemRow,
  lineDiscountCents: number,
): number {
  let discount = lineDiscountCents;
  let adjustedTotal = item.total_price_cents - discount;

  while (adjustedTotal > 0 && adjustedTotal % item.quantity !== 0 && discount > 0) {
    discount -= 1;
    adjustedTotal = item.total_price_cents - discount;
  }

  if (adjustedTotal <= 0 || adjustedTotal % item.quantity !== 0) {
    throw new StripeCheckoutError(
      `Remise incompatible avec la quantité pour ${item.product_name}.`,
      500,
    );
  }

  return adjustedTotal / item.quantity;
}

/**
 * Construit les line_items Stripe à partir des lignes commande en base.
 * Les montants proviennent exclusivement de Supabase (jamais du client).
 * Une remise bundle est répartie proportionnellement sur les articles.
 */
export function buildStripeCheckoutLineItems({
  orderItems,
  shippingCents,
  discountCents,
  expectedTotalCents,
}: BuildLineItemsInput): Stripe.Checkout.SessionCreateParams.LineItem[] {
  if (orderItems.length === 0) {
    throw new StripeCheckoutError("Aucun article dans la commande.");
  }

  const lineDiscounts = allocateLineDiscounts(orderItems, discountCents);

  const productLines: Stripe.Checkout.SessionCreateParams.LineItem[] = orderItems.map(
    (item, index) => {
      if (item.unit_price_cents <= 0 || item.quantity <= 0) {
        throw new StripeCheckoutError(`Prix invalide pour ${item.product_name}.`);
      }

      const expectedLineTotal = item.unit_price_cents * item.quantity;
      if (expectedLineTotal !== item.total_price_cents) {
        throw new StripeCheckoutError(`Incohérence de prix pour ${item.product_name}.`);
      }

      const unitAmount = resolveDiscountedUnitAmount(item, lineDiscounts[index] ?? 0);

      return {
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: unitAmount,
          product_data: {
            name: item.product_name,
            description:
              [item.size_label, item.age_label].filter(Boolean).join(" · ") ||
              undefined,
            metadata: {
              variant_id: item.variant_id ?? "",
              sku: item.sku,
            },
          },
        },
        quantity: item.quantity,
      };
    },
  );

  const lines: Stripe.Checkout.SessionCreateParams.LineItem[] = [...productLines];

  if (shippingCents > 0) {
    lines.push({
      price_data: {
        currency: STRIPE_CURRENCY,
        unit_amount: shippingCents,
        product_data: {
          name: "Livraison point relais Mondial Relay",
        },
      },
      quantity: 1,
    });
  }

  const computedSubtotal = orderItems.reduce(
    (sum, item, index) =>
      sum +
      resolveDiscountedUnitAmount(item, lineDiscounts[index] ?? 0) * item.quantity,
    0,
  );
  const computedTotal = computedSubtotal + shippingCents;

  if (computedTotal !== expectedTotalCents) {
    throw new StripeCheckoutError("Le total de la commande est incohérent.", 500);
  }

  if (computedTotal <= 0) {
    throw new StripeCheckoutError("Le montant total doit être supérieur à zéro.");
  }

  return lines;
}
