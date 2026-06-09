type WebhookLogLevel = "info" | "warn" | "error";

interface WebhookLogMeta {
  eventId?: string;
  eventType?: string;
  orderId?: string;
  [key: string]: unknown;
}

export function logStripeWebhook(
  level: WebhookLogLevel,
  message: string,
  meta: WebhookLogMeta = {},
): void {
  const payload = {
    scope: "stripe-webhook",
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}
