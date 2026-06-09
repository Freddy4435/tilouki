import "server-only";

import { getEmailConfig } from "@/lib/email/config";
import { logEmail } from "@/lib/email/logger";
import { createResendProvider } from "@/lib/email/providers/resend";
import { createSmtpProvider } from "@/lib/email/providers/smtp";
import type { EmailProviderAdapter } from "@/lib/email/providers/types";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  id: string;
  skipped: boolean;
}

function getProvider(): EmailProviderAdapter | null {
  const config = getEmailConfig();

  if (config.provider === "resend" && config.resendApiKey) {
    return createResendProvider(config.resendApiKey);
  }

  if (config.provider === "smtp" && config.smtp) {
    return createSmtpProvider(config.smtp);
  }

  return null;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const config = getEmailConfig();
  const provider = getProvider();

  if (!provider) {
    const level = process.env.NODE_ENV === "production" ? "error" : "info";
    logEmail(level, "E-mail non envoyé (aucun fournisseur configuré)", {
      to: input.to,
      subject: input.subject,
      provider: config.provider,
    });
    return { id: "dev-skipped", skipped: true };
  }

  const result = await provider.send({
    from: config.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  logEmail("info", "E-mail envoyé", {
    to: input.to,
    subject: input.subject,
    provider: config.provider,
    id: result.id,
  });

  return { id: result.id, skipped: false };
}
