import { describe, expect, it } from "vitest";

import { buildPrepSlipHtml } from "@/lib/admin/prep-slip";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";

function mockOrder(overrides: Partial<AdminOrderDetail> = {}): AdminOrderDetail {
  return {
    id: "order-1",
    orderNumber: "TIL-1001",
    customerName: "Marie Dupont",
    customerEmail: "marie@example.com",
    customerPhone: "0612345678",
    customerFirstName: "Marie",
    customerLastName: "Dupont",
    status: "preparing",
    paymentStatus: "paid",
    totalCents: 4590,
    subtotalCents: 4200,
    shippingCents: 390,
    discountCents: 0,
    currency: "EUR",
    createdAt: "2026-06-01T10:00:00.000Z",
    relayPointLabel: "Relais Paris",
    trackingNumber: null,
    shippingNumber: null,
    shippingLabelUrl: null,
    labelCreatedAt: null,
    trackingToken: "token",
    stripeSessionId: null,
    stripePaymentIntentId: null,
    relayPointId: "REL-1",
    relayPointName: "Tabac Presse",
    relayPointAddress: "1 rue de la Paix",
    relayPointZip: "75001",
    relayPointCity: "Paris",
    relayPointCountry: "FR",
    shippingProvider: "mondial_relay",
    shippingMethod: "relay_point",
    totalWeightGrams: 450,
    shippingRateLabel: "0–500 g",
    internalNotes: null,
    statusHistory: [],
    items: [
      {
        id: "item-1",
        productName: "Body coton",
        sku: "BODY-3M",
        sizeLabel: "3M",
        ageLabel: null,
        quantity: 1,
        unitPriceCents: 4200,
        totalPriceCents: 4200,
      },
    ],
    ...overrides,
  };
}

describe("buildPrepSlipHtml", () => {
  it("inclut les informations commande et client", () => {
    const html = buildPrepSlipHtml(mockOrder());
    expect(html).toContain("Bon de préparation — TIL-1001");
    expect(html).toContain("Marie Dupont");
    expect(html).toContain("Body coton");
    expect(html).toContain("Tabac Presse");
  });

  it("échappe le HTML injecté dans les champs client", () => {
    const html = buildPrepSlipHtml(
      mockOrder({
        customerName: '<img src=x onerror="alert(1)">',
        customerEmail: 'evil@example.com"><script>alert(1)</script>',
        internalNotes: "</div><script>alert('xss')</script>",
        items: [
          {
            id: "item-x",
            productName: "<svg onload=alert(1)>",
            sku: 'SKU"><iframe>',
            sizeLabel: "<em>",
            ageLabel: null,
            quantity: 1,
            unitPriceCents: 1000,
            totalPriceCents: 1000,
          },
        ],
        relayPointName: "<b onclick=alert(1)>Relais</b>",
      }),
    );

    expect(html).not.toMatch(/<script[\s>]/i);
    expect(html).not.toMatch(/<iframe[\s>]/i);
    expect(html).not.toMatch(/<img[\s>]/i);
    expect(html).not.toMatch(/<svg[\s>]/i);

    expect(html).toContain("&lt;img src=x onerror=");
    expect(html).toContain("&lt;svg onload=alert(1)&gt;");
    expect(html).toContain("&lt;b onclick=alert(1)&gt;Relais&lt;/b&gt;");
  });

  it("ne contient pas document.write", () => {
    const html = buildPrepSlipHtml(mockOrder());
    expect(html.toLowerCase()).not.toContain("document.write");
  });
});
