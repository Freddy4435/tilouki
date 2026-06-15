import "server-only";

import { logEmail } from "@/lib/email/logger";
import { orderForWebhookToEmailPayload } from "@/lib/email/mappers";
import { sendEmail } from "@/lib/email/send";
import { renderOrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import type { OrderEmailPayload } from "@/lib/email/types";
import type { OrderForWebhook } from "@/lib/supabase/queries/orders";

export async function sendOrderConfirmation(
  order: OrderForWebhook | OrderEmailPayload,
): Promise<void> {
  const payload = "orderNumber" in order ? order : orderForWebhookToEmailPayload(order);
  const rendered = renderOrderConfirmationEmail(payload);

  try {
    await sendEmail({
      to: payload.customerEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      previewTag: "order-confirmation",
    });
  } catch (error) {
    logEmail("error", "Échec envoi confirmation commande client", {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
