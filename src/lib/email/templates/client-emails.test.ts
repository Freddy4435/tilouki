import { describe, expect, it } from "vitest";

import { sampleOrderEmailPayload } from "@/lib/email/fixtures";
import { renderAdminNewOrderEmail } from "@/lib/email/templates/admin-new-order";
import { renderOrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { renderPaymentFailedEmail } from "@/lib/email/templates/payment-failed";
import { renderRefundConfirmationEmail } from "@/lib/email/templates/refund-confirmation";
import { renderShippingConfirmationEmail } from "@/lib/email/templates/shipping-confirmation";

const sampleOrder = { ...sampleOrderEmailPayload, orderId: "ord-1" };

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

  it("remboursement : montant et confirmation client", () => {
    const email = renderRefundConfirmationEmail(sampleOrder);

    expect(email.subject).toContain("Remboursement confirmé");
    expect(email.html).toContain("remboursée intégralement");
    expect(email.html).toContain("29,90");
  });

  it("expédition : suivi transporteur et point relais", () => {
    const email = renderShippingConfirmationEmail(sampleOrder);

    expect(email.subject).toBe("Votre commande TK-2026-001 a été expédiée");
    expect(email.html).toContain("12345678");
    expect(email.html).toContain("Suivre mon colis Mondial Relay");
    expect(email.html).toContain("Tabac Presse");
  });

  it("notification admin : client, montant et lien back-office", () => {
    const email = renderAdminNewOrderEmail(sampleOrder);

    expect(email.subject).toBe("[Tilouki] Nouvelle commande TK-2026-001");
    expect(email.html).toContain("Nouvelle commande payée");
    expect(email.html).toContain("marie@example.com");
    expect(email.html).toContain("/admin/commandes/ord-1");
    expect(email.text).toContain("29,90");
  });
});
