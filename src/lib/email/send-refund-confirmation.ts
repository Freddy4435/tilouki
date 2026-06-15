import "server-only";

import { logEmail } from "@/lib/email/logger";
import { orderForWebhookToEmailPayload } from "@/lib/email/mappers";
import { sendEmail } from "@/lib/email/send";
import {
  renderRefundConfirmationEmail,
  type RefundEmailOptions,
} from "@/lib/email/templates/refund-confirmation";
import type { OrderForWebhook } from "@/lib/supabase/queries/orders";

export async function sendRefundConfirmationEmail(
  order: OrderForWebhook,
  options?: RefundEmailOptions,
): Promise<void> {
  const payload = orderForWebhookToEmailPayload(order);
  const rendered = renderRefundConfirmationEmail(payload, options);

  try {
    await sendEmail({
      to: payload.customerEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      previewTag: "refund-confirmation",
    });
  } catch (error) {
    logEmail("error", "Échec envoi e-mail remboursement", {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
