import { escapeHtml } from "@/lib/email/format";
import { emailButton, wrapEmailLayout } from "@/lib/email/templates/layout";
import type { RenderedEmail } from "@/lib/email/types";

interface NewsletterConfirmationEmailInput {
  shopName: string;
  siteUrl: string;
  confirmUrl: string;
}

export function renderNewsletterConfirmationEmail(
  input: NewsletterConfirmationEmailInput,
): RenderedEmail {
  const shopName = escapeHtml(input.shopName);
  const confirmUrl = escapeHtml(input.confirmUrl);

  const contentHtml = `
    <p style="margin:0 0 16px;">Merci pour votre inscription à la newsletter ${shopName}.</p>
    <p style="margin:0 0 16px;">Pour confirmer votre adresse et recevoir nos nouveautés, cliquez sur le bouton ci-dessous :</p>
    ${emailButton(confirmUrl, "Confirmer mon inscription")}
    <p style="margin:16px 0 0;font-size:13px;color:#71717a;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
  `.trim();

  const subject = `Confirmez votre inscription — ${input.shopName}`;

  const text = [
    `Merci pour votre inscription à la newsletter ${input.shopName}.`,
    "",
    "Pour confirmer votre adresse, ouvrez ce lien :",
    input.confirmUrl,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
  ].join("\n");

  return {
    subject,
    html: wrapEmailLayout({
      shopName: input.shopName,
      siteUrl: input.siteUrl,
      contentHtml,
      previewText: "Confirmez votre inscription à la newsletter.",
    }),
    text,
  };
}
