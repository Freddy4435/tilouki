import "server-only";

import { getEmailConfig } from "@/lib/email/config";
import {
  buildCarrierTrackingUrl,
  getCarrierTrackingLabel,
} from "@/lib/shipping/tracking";
import type { OrderEmailPayload, OrderEmailRelayPoint } from "@/lib/email/types";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";
import type { OrderForWebhook } from "@/lib/supabase/queries/orders";

function mapRelayFromWebhook(order: OrderForWebhook): OrderEmailRelayPoint {
  return {
    name: order.relay_point_name ?? "Point relais",
    address: order.relay_point_address ?? "",
    zip: order.relay_point_zip ?? "",
    city: order.relay_point_city ?? "",
    country: order.relay_point_country,
  };
}

function mapRelayFromAdmin(order: AdminOrderDetail): OrderEmailRelayPoint {
  return {
    name: order.relayPointName ?? "Point relais",
    address: order.relayPointAddress ?? "",
    zip: order.relayPointZip ?? "",
    city: order.relayPointCity ?? "",
    country: order.relayPointCountry,
  };
}

export function orderForWebhookToEmailPayload(
  order: OrderForWebhook,
): OrderEmailPayload {
  const { shopName, siteUrl } = getEmailConfig();

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    customerFirstName: order.customer_first_name,
    customerLastName: order.customer_last_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    discountCents: order.discount_cents ?? 0,
    totalCents: order.total_cents,
    currency: order.currency ?? "EUR",
    items: order.items.map((item) => ({
      productName: item.product_name,
      sku: item.sku,
      sizeLabel: item.size_label,
      ageLabel: item.age_label,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
      totalPriceCents: item.total_price_cents,
    })),
    relayPoint: mapRelayFromWebhook(order),
    trackingToken: order.tracking_token,
    trackingNumber: order.tracking_number,
    carrierName: getCarrierTrackingLabel(order.shipping_provider),
    siteUrl,
    shopName,
  };
}

export function adminOrderToEmailPayload(order: AdminOrderDetail): OrderEmailPayload {
  const { shopName, siteUrl } = getEmailConfig();

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerFirstName: order.customerFirstName,
    customerLastName: order.customerLastName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    currency: order.currency,
    items: order.items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      sizeLabel: item.sizeLabel,
      ageLabel: item.ageLabel,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      totalPriceCents: item.totalPriceCents,
    })),
    relayPoint: mapRelayFromAdmin(order),
    trackingToken: order.trackingToken,
    trackingNumber: order.trackingNumber,
    carrierTrackingUrl: buildCarrierTrackingUrl(
      order.shippingProvider,
      order.shippingNumber ?? order.trackingNumber,
      order.relayPointZip,
    ),
    carrierName: getCarrierTrackingLabel(order.shippingProvider),
    siteUrl,
    shopName,
  };
}
