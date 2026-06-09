import "server-only";

import { logEmail } from "@/lib/email/logger";
import { orderForWebhookToEmailPayload } from "@/lib/email/mappers";
import { sendEmail } from "@/lib/email/send";
import { renderPaymentFailedEmail } from "@/lib/email/templates/payment-failed";
import type { OrderForWebhook } from "@/lib/supabase/queries/orders";

export async function sendPaymentFailedEmail(
  order: OrderForWebhook,
  options?: { reason?: string | null },
): Promise<void> {
  const payload = orderForWebhookToEmailPayload(order);
  const rendered = renderPaymentFailedEmail(payload, options);

  try {
    await sendEmail({
      to: payload.customerEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  } catch (error) {
    logEmail("error", "Échec envoi e-mail paiement refusé", {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
