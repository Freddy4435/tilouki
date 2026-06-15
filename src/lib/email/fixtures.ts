import type { OrderEmailPayload } from "@/lib/email/types";

/** Données fictives pour tests unitaires, preview dev et scripts. */
export const sampleOrderEmailPayload: OrderEmailPayload = {
  orderId: "ord-preview-1",
  orderNumber: "TK-2026-001",
  customerFirstName: "Marie",
  customerLastName: "Dupont",
  customerEmail: "marie@example.com",
  customerPhone: "06 12 34 56 78",
  subtotalCents: 2500,
  shippingCents: 490,
  discountCents: 0,
  totalCents: 2990,
  currency: "EUR",
  items: [
    {
      productName: "Body coton bio",
      sizeLabel: "6 mois",
      quantity: 1,
      unitPriceCents: 2500,
      totalPriceCents: 2500,
    },
  ],
  relayPoint: {
    name: "Tabac Presse",
    address: "12 rue de la Paix",
    zip: "75002",
    city: "Paris",
    country: "FR",
  },
  trackingToken: "abc123token",
  trackingNumber: "12345678",
  carrierName: "Mondial Relay",
  carrierTrackingUrl:
    "https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=12345678",
  siteUrl: "https://tilouki.fr",
  shopName: "Tilouki",
};
