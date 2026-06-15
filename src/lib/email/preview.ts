import { sampleOrderEmailPayload } from "@/lib/email/fixtures";
import { renderAdminNewOrderEmail } from "@/lib/email/templates/admin-new-order";
import { renderOrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { renderPaymentFailedEmail } from "@/lib/email/templates/payment-failed";
import { renderRefundConfirmationEmail } from "@/lib/email/templates/refund-confirmation";
import { renderShippingConfirmationEmail } from "@/lib/email/templates/shipping-confirmation";
import type { RenderedEmail } from "@/lib/email/types";

export const EMAIL_PREVIEW_TYPES = [
  { id: "order-confirmation", label: "Confirmation commande (client)" },
  { id: "payment-failed", label: "Paiement échoué (client)" },
  { id: "shipping-confirmation", label: "Expédition (client)" },
  { id: "admin-new-order", label: "Nouvelle commande (admin)" },
  { id: "refund-confirmation", label: "Remboursement (client)" },
] as const;

export type EmailPreviewType = (typeof EMAIL_PREVIEW_TYPES)[number]["id"];

export function renderEmailPreview(type: EmailPreviewType): RenderedEmail {
  const order = sampleOrderEmailPayload;

  switch (type) {
    case "order-confirmation":
      return renderOrderConfirmationEmail(order);
    case "payment-failed":
      return renderPaymentFailedEmail(order, {
        reason: "Votre carte a été refusée par votre banque.",
      });
    case "shipping-confirmation":
      return renderShippingConfirmationEmail(order);
    case "admin-new-order":
      return renderAdminNewOrderEmail(order);
    case "refund-confirmation":
      return renderRefundConfirmationEmail(order);
    default: {
      const exhaustive: never = type;
      throw new Error(`Type d'e-mail preview inconnu : ${exhaustive}`);
    }
  }
}

export function isEmailPreviewType(value: string): value is EmailPreviewType {
  return EMAIL_PREVIEW_TYPES.some((entry) => entry.id === value);
}
