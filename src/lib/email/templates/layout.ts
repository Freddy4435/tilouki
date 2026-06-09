import { escapeHtml } from "@/lib/email/format";

interface EmailLayoutInput {
  shopName: string;
  siteUrl: string;
  contentHtml: string;
  previewText?: string;
}

export function wrapEmailLayout(input: EmailLayoutInput): string {
  const shopName = escapeHtml(input.shopName);
  const siteUrl = escapeHtml(input.siteUrl);
  const preview = input.previewText ? escapeHtml(input.previewText) : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${shopName}</title>
  ${preview ? `<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;">${preview}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
              <a href="${siteUrl}" style="text-decoration:none;color:#18181b;font-size:18px;font-weight:600;letter-spacing:-0.02em;">${shopName}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#3f3f46;font-size:15px;line-height:1.65;">
              ${input.contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.5;color:#71717a;">
              <p style="margin:0 0 8px;">${shopName} — <a href="${siteUrl}" style="color:#71717a;">${siteUrl.replace(/^https?:\/\//, "")}</a></p>
              <p style="margin:0;">Cet e-mail est envoyé automatiquement, merci de ne pas y répondre directement sauf indication contraire.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);

  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:8px;background:#18181b;">
        <a href="${safeHref}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${safeLabel}</a>
      </td>
    </tr>
  </table>`;
}

export function emailInfoBox(title: string, bodyHtml: string): string {
  return `<div style="margin:20px 0;padding:16px 18px;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#71717a;">${escapeHtml(title)}</p>
    <div style="margin:0;color:#18181b;">${bodyHtml}</div>
  </div>`;
}
