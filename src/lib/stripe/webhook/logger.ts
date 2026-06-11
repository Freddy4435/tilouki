import { logSecure } from "@/lib/security/log";

type WebhookLogLevel = "info" | "warn" | "error";

interface WebhookLogMeta {
  eventId?: string;
  eventType?: string;
  orderId?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  "customer_email",
  "email",
  "customerEmail",
  "payment_method",
  "card",
  "last4",
  "client_secret",
]);

function sanitizeWebhookMeta(meta: WebhookLogMeta): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = "[redacted]";
      continue;
    }
    sanitized[key] = value;
  }

  return sanitized;
}

export function logStripeWebhook(
  level: WebhookLogLevel,
  message: string,
  meta: WebhookLogMeta = {},
): void {
  logSecure(level, `stripe-webhook: ${message}`, {
    scope: "stripe-webhook",
    ...sanitizeWebhookMeta(meta),
  });
}
