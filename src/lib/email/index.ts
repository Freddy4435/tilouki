export { getEmailConfig, isEmailConfigured } from "@/lib/email/config";
export { sendEmail } from "@/lib/email/send";
export { sendOrderConfirmation } from "@/lib/email/send-order-confirmation";
export { sendAdminNewOrderNotification } from "@/lib/email/send-admin-new-order-notification";
export { sendShippingConfirmation } from "@/lib/email/send-shipping-confirmation";
export { sendPaymentFailedEmail } from "@/lib/email/send-payment-failed";
export type { OrderEmailPayload } from "@/lib/email/types";

import type { OrderForWebhook } from "@/lib/supabase/queries/orders";

import { sendAdminNewOrderNotification } from "@/lib/email/send-admin-new-order-notification";
import { sendOrderConfirmation } from "@/lib/email/send-order-confirmation";

/** Envoie confirmation client + notification admin après paiement réussi. */
export async function sendOrderPaidEmails(order: OrderForWebhook): Promise<void> {
  await sendOrderConfirmation(order);
  await sendAdminNewOrderNotification(order);
}
