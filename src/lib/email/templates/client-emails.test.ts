import { describe, expect, it } from "vitest";

import { renderOrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { renderPaymentFailedEmail } from "@/lib/email/templates/payment-failed";
import { renderShippingConfirmationEmail } from "@/lib/email/templates/shipping-confirmation";
import type { OrderEmailPayload } from "@/lib/email/types";

const sampleOrder: OrderEmailPayload = {
  orderId: "ord-1",
  orderNumber: "TK-2026-001",
  customerFirstName: "Marie",
  customerLastName: "Dupont",
  customerEmail: "marie@example.com",
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
  carrierTrackingUrl: "https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=12345678",
  siteUrl: "https://tilouki.fr",
  shopName: "Tilouki",
};

describe("e-mails client transactionnels", () => {
  it("confirmation de commande : sujet, montant et point relais", () => {
    const email = renderOrderConfirmationEmail(sampleOrder);

    expect(email.subject).toBe("Confirmation de commande TK-2026-001");
    expect(email.html).toContain("Votre paiement est confirmé");
    expect(email.html).toContain("Point relais Mondial Relay");
    expect(email.html).toContain("29,90");
    expect(email.text).toContain("Code de suivi Tilouki : abc123token");
  });

  it("confirmation Chronopost : libellé transporteur dynamique", () => {
    const email = renderOrderConfirmationEmail({
      ...sampleOrder,
      carrierName: "Chronopost",
    });

    expect(email.html).toContain("Point relais Chronopost");
  });

  it("paiement échoué : montant et CTA reprise commande", () => {
    const email = renderPaymentFailedEmail(sampleOrder, {
      reason: "Votre carte a été refusée.",
    });

    expect(email.subject).toContain("Paiement non abouti");
    expect(email.html).toContain("Montant de la commande");
    expect(email.html).toContain("Votre carte a été refusée.");
    expect(email.html).toContain("stock réservé");
    expect(email.html).toContain("https://tilouki.fr/commande");
  });

  it("expédition : suivi transporteur et point relais", () => {
    const email = renderShippingConfirmationEmail(sampleOrder);

    expect(email.subject).toBe("Votre commande TK-2026-001 a été expédiée");
    expect(email.html).toContain("12345678");
    expect(email.html).toContain("Suivre mon colis Mondial Relay");
    expect(email.html).toContain("Tabac Presse");
  });
});
