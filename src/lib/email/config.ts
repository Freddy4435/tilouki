import "server-only";

import { siteConfig } from "@/lib/constants/site";

export type EmailProvider = "resend" | "smtp" | "none";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
}

export interface EmailConfig {
  provider: EmailProvider;
  from: string;
  adminEmail: string | null;
  shopName: string;
  siteUrl: string;
  resendApiKey: string | null;
  smtp: SmtpConfig | null;
}

function formatFromAddress(email: string, shopName: string): string {
  const trimmed = email.trim();
  if (trimmed.includes("<")) return trimmed;
  return `${shopName} <${trimmed}>`;
}

export function getEmailConfig(): EmailConfig {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? siteConfig.name;
  const fromRaw =
    process.env.FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "commandes@tilouki.fr";

  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_SHOP_CONTACT_EMAIL?.trim() ||
    null;

  const resendApiKey = process.env.RESEND_API_KEY?.trim() || null;
  const smtpHost = process.env.SMTP_HOST?.trim();

  const smtp: SmtpConfig | null = smtpHost
    ? {
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        user: process.env.SMTP_USER?.trim() ?? "",
        password: process.env.SMTP_PASSWORD?.trim() ?? "",
        secure: process.env.SMTP_SECURE === "true",
      }
    : null;

  const provider: EmailProvider = resendApiKey ? "resend" : smtp ? "smtp" : "none";

  return {
    provider,
    from: formatFromAddress(fromRaw, shopName),
    adminEmail,
    shopName,
    siteUrl: siteConfig.url,
    resendApiKey,
    smtp,
  };
}

export function isEmailConfigured(): boolean {
  return getEmailConfig().provider !== "none";
}
