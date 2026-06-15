import "server-only";

import type { EmailConfig, EmailProvider } from "@/lib/email/config";
import { getEmailConfig } from "@/lib/email/config";

export type EmailEnvIssueLevel = "error" | "warn";

export interface EmailEnvIssue {
  level: EmailEnvIssueLevel;
  message: string;
}

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmailAddress(value: string): boolean {
  return EMAIL_FORMAT.test(value.trim());
}

function extractEmailAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match?.[1] ?? from).trim();
}

function validateProvider(
  provider: EmailProvider,
  config: EmailConfig,
  production: boolean,
): EmailEnvIssue[] {
  const issues: EmailEnvIssue[] = [];

  if (provider === "none") {
    issues.push({
      level: production ? "error" : "warn",
      message: production
        ? "Aucun fournisseur e-mail : configurez RESEND_API_KEY ou SMTP_HOST + SMTP_USER + SMTP_PASSWORD."
        : "Aucun fournisseur e-mail — les envois seront ignorés (utilisez /dev/emails pour prévisualiser).",
    });
    return issues;
  }

  if (provider === "smtp" && config.smtp) {
    if (!config.smtp.user) {
      issues.push({ level: "error", message: "SMTP_USER manquant." });
    }
    if (!config.smtp.password) {
      issues.push({ level: "error", message: "SMTP_PASSWORD manquant." });
    }
  }

  return issues;
}

/**
 * Vérifie la configuration e-mail (Resend ou SMTP, expéditeur, admin).
 * Aligné avec `npm run verify:deploy`.
 */
export function validateEmailEnvironment(options?: {
  production?: boolean;
  config?: EmailConfig;
}): EmailEnvIssue[] {
  const production = options?.production ?? process.env.NODE_ENV === "production";
  const config = options?.config ?? getEmailConfig();
  const issues: EmailEnvIssue[] = [];

  const fromAddress = extractEmailAddress(config.from);
  if (!fromAddress) {
    issues.push({ level: "error", message: "FROM_EMAIL manquant." });
  } else if (!isValidEmailAddress(fromAddress)) {
    issues.push({
      level: "error",
      message: "FROM_EMAIL invalide (format attendu : commandes@votredomaine.fr).",
    });
  }

  if (!config.adminEmail) {
    issues.push({
      level: production ? "error" : "warn",
      message: "ADMIN_EMAIL manquant — les notifications admin ne seront pas envoyées.",
    });
  } else if (!isValidEmailAddress(config.adminEmail)) {
    issues.push({ level: "error", message: "ADMIN_EMAIL invalide." });
  }

  issues.push(...validateProvider(config.provider, config, production));

  if (
    production &&
    config.provider === "resend" &&
    fromAddress.includes("@gmail.com")
  ) {
    issues.push({
      level: "warn",
      message:
        "FROM_EMAIL sur @gmail.com en production — préférez un domaine vérifié dans Resend (ex. commandes@tilouki.fr).",
    });
  }

  return issues;
}

export function isEmailEnvironmentValid(options?: {
  production?: boolean;
  config?: EmailConfig;
}): boolean {
  return !validateEmailEnvironment(options).some((issue) => issue.level === "error");
}
