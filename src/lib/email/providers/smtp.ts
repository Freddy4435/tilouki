import nodemailer from "nodemailer";

import type { SmtpConfig } from "@/lib/email/config";
import type {
  EmailProviderAdapter,
  ProviderSendInput,
  ProviderSendResult,
} from "@/lib/email/providers/types";

export function createSmtpProvider(config: SmtpConfig): EmailProviderAdapter {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user
      ? {
          user: config.user,
          pass: config.password,
        }
      : undefined,
  });

  return {
    async send(input: ProviderSendInput): Promise<ProviderSendResult> {
      const info = await transport.sendMail({
        from: input.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });

      return { id: info.messageId || "smtp-sent" };
    },
  };
}
