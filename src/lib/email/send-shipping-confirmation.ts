import "server-only";

import { logEmail } from "@/lib/email/logger";
import { adminOrderToEmailPayload } from "@/lib/email/mappers";
import { sendEmail } from "@/lib/email/send";
import { renderShippingConfirmationEmail } from "@/lib/email/templates/shipping-confirmation";
import type { OrderEmailPayload } from "@/lib/email/types";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";

export async function sendShippingConfirmation(
  order: AdminOrderDetail | OrderEmailPayload,
): Promise<void> {
  const payload: OrderEmailPayload =
    "relayPoint" in order ? order : adminOrderToEmailPayload(order);

  const rendered = renderShippingConfirmationEmail(payload);

  try {
    await sendEmail({
      to: payload.customerEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  } catch (error) {
    logEmail("error", "Échec envoi confirmation expédition", {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
