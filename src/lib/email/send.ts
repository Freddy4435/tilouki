import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getEmailConfig } from "@/lib/email/config";
import { logEmail } from "@/lib/email/logger";
import { sanitizeProviderErrorMessage } from "@/lib/email/providers/errors";
import { createResendProvider } from "@/lib/email/providers/resend";
import { createSmtpProvider } from "@/lib/email/providers/smtp";
import type { EmailProviderAdapter } from "@/lib/email/providers/types";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Étiquette optionnelle pour les fichiers preview (dev). */
  previewTag?: string;
}

export interface SendEmailResult {
  id: string;
  skipped: boolean;
  devRedirected?: boolean;
  previewWritten?: boolean;
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

function resolveRecipients(to: string | string[]): {
  to: string | string[];
  devRedirected: boolean;
} {
  const redirect = process.env.EMAIL_DEV_REDIRECT?.trim();
  if (redirect && process.env.NODE_ENV !== "production") {
    return { to: redirect, devRedirected: true };
  }
  return { to, devRedirected: false };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function maybeWritePreviewFile(input: SendEmailInput): Promise<string | null> {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.EMAIL_PREVIEW_WRITE !== "true") return null;

  const dir = join(process.cwd(), ".email-preview");
  await mkdir(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tag = slugify(input.previewTag ?? input.subject);
  const baseName = `${stamp}-${tag}`;
  const htmlPath = join(dir, `${baseName}.html`);
  const textPath = join(dir, `${baseName}.txt`);

  await writeFile(htmlPath, input.html, "utf8");
  await writeFile(textPath, input.text, "utf8");

  return baseName;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const config = getEmailConfig();
  const provider = getProvider();
  const { to, devRedirected } = resolveRecipients(input.to);
  const previewBaseName = await maybeWritePreviewFile(input);

  if (!provider) {
    const level = process.env.NODE_ENV === "production" ? "error" : "info";
    logEmail(level, "E-mail non envoyé (aucun fournisseur configuré)", {
      to,
      subject: input.subject,
      provider: config.provider,
      previewWritten: Boolean(previewBaseName),
    });
    return {
      id: previewBaseName ?? "dev-skipped",
      skipped: true,
      previewWritten: Boolean(previewBaseName),
    };
  }

  try {
    const result = await provider.send({
      from: config.from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    logEmail("info", "E-mail envoyé", {
      to,
      subject: input.subject,
      provider: config.provider,
      id: result.id,
      devRedirected,
      previewWritten: Boolean(previewBaseName),
    });

    return {
      id: result.id,
      skipped: false,
      devRedirected,
      previewWritten: Boolean(previewBaseName),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? sanitizeProviderErrorMessage(error.message)
        : sanitizeProviderErrorMessage(String(error));

    logEmail("error", "Échec envoi e-mail", {
      to,
      subject: input.subject,
      provider: config.provider,
      error: message,
      devRedirected,
    });

    throw new Error(message, { cause: error });
  }
}
