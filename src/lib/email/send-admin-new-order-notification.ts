import "server-only";

import { getEmailConfig } from "@/lib/email/config";
import { logEmail } from "@/lib/email/logger";
import { orderForWebhookToEmailPayload } from "@/lib/email/mappers";
import { sendEmail } from "@/lib/email/send";
import { renderAdminNewOrderEmail } from "@/lib/email/templates/admin-new-order";
import type { OrderEmailPayload } from "@/lib/email/types";
import type { OrderForWebhook } from "@/lib/supabase/queries/orders";

export async function sendAdminNewOrderNotification(
  order: OrderForWebhook | OrderEmailPayload,
): Promise<void> {
  const config = getEmailConfig();

  if (!config.adminEmail) {
    logEmail("warn", "E-mail admin non configuré (ADMIN_EMAIL)", {
      orderId: "orderNumber" in order ? order.orderId : order.id,
    });
    return;
  }

  const payload = "orderNumber" in order ? order : orderForWebhookToEmailPayload(order);
  const rendered = renderAdminNewOrderEmail(payload);

  try {
    await sendEmail({
      to: config.adminEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      previewTag: "admin-new-order",
    });
  } catch (error) {
    logEmail("error", "Échec envoi notification admin", {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
