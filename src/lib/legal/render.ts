import type { LegalRenderContext } from "@/lib/legal/context";
import { getDefaultLegalTemplate } from "@/lib/legal/templates";

export const PLACEHOLDER_CONTENT_MARKERS = [
  "Contenu à compléter",
  "Contenu a completer",
  "Contenu à initialiser",
  "Contenu a initialiser",
  "<p>Contenu à compléter",
  "à compléter depuis l'administration",
  "a completer depuis l'administration",
] as const;

const LEGAL_REVIEW_MARKERS = [
  "à valider avec un professionnel du droit",
  "document type",
] as const;

const LEGAL_REVIEW_BLOCK_REGEX =
  /<(?:aside|p|td|div)[^>]*class="legal-review"[^>]*>[\s\S]*?<\/(?:aside|p|td|div)>/gi;
const LEGAL_DISCLAIMER_BLOCK_REGEX =
  /<aside class="legal-disclaimer[\s\S]*?<\/aside>/gi;
const ADMIN_PLACEHOLDER_REGEX = /\[À renseigner\s*:[^\]]+\]/gi;
const INCOMPLETE_CONTENT_REGEX =
  /contenu à compléter|contenu à initialiser|contenu a completer|contenu a initialiser/gi;
const UNRESOLVED_VARIABLE_REGEX = /\{\{[a-z_]+\}\}/gi;

export function isPlaceholderLegalContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_CONTENT_MARKERS.some((m) => trimmed.includes(m));
}

export function hasUnresolvedAdminPlaceholders(html: string): boolean {
  ADMIN_PLACEHOLDER_REGEX.lastIndex = 0;
  return ADMIN_PLACEHOLDER_REGEX.test(html);
}

export function containsPublicLegalPlaceholder(html: string): boolean {
  const normalized = html.normalize("NFC");

  if (
    PLACEHOLDER_CONTENT_MARKERS.some((marker) =>
      normalized.toLowerCase().includes(marker.toLowerCase()),
    )
  ) {
    return true;
  }

  ADMIN_PLACEHOLDER_REGEX.lastIndex = 0;
  if (ADMIN_PLACEHOLDER_REGEX.test(normalized)) return true;

  UNRESOLVED_VARIABLE_REGEX.lastIndex = 0;
  if (UNRESOLVED_VARIABLE_REGEX.test(normalized)) return true;

  if (
    LEGAL_REVIEW_MARKERS.some((marker) => normalized.toLowerCase().includes(marker))
  ) {
    return true;
  }

  if (/class="legal-(disclaimer|review)"/i.test(normalized)) return true;

  return false;
}

/**
 * Nettoie le HTML public : aucun « contenu à compléter » ni [À renseigner] visible en production.
 */
export function finalizePublicLegalHtml(html: string): string {
  let output = html
    .replace(LEGAL_DISCLAIMER_BLOCK_REGEX, "")
    .replace(LEGAL_REVIEW_BLOCK_REGEX, "")
    .replace(ADMIN_PLACEHOLDER_REGEX, "")
    .replace(INCOMPLETE_CONTENT_REGEX, "")
    .replace(UNRESOLVED_VARIABLE_REGEX, "");

  // Listes / paragraphes vides après suppression des placeholders
  output = output
    .replace(/<li>\s*<strong>[^<]+:<\/strong>\s*<\/li>/gi, "")
    .replace(/<li>\s*<\/li>/gi, "")
    .replace(/<p>\s*<strong>[^<]+:<\/strong>\s*<\/p>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<td>\s*<\/td>/gi, "")
    .replace(/\n{3,}/g, "\n\n");

  return output.trim();
}

export function resolveLegalPageHtml(
  slug: string,
  storedContent: string | null | undefined,
  ctx: LegalRenderContext,
  options?: { audience?: "public" | "admin" },
): string {
  const audience = options?.audience ?? "public";
  const template = getDefaultLegalTemplate(slug);
  let content = storedContent?.trim() ?? "";

  if (!content || isPlaceholderLegalContent(content)) {
    content = template?.content ?? content;
  }

  const rendered = renderLegalContent(content, ctx);
  return audience === "public" ? finalizePublicLegalHtml(rendered) : rendered;
}

export function renderLegalContent(template: string, ctx: LegalRenderContext): string {
  let html = template;

  const replacements: Record<string, string> = {
    shop_name: ctx.shop_name,
    legal_name: ctx.legal_name,
    legal_status: ctx.legal_status,
    siret: ctx.siret,
    address: ctx.address,
    email: ctx.email,
    phone: ctx.phone,
    host_name: ctx.host_name,
    host_address: ctx.host_address,
    host_phone: ctx.host_phone,
    host_email: ctx.host_email,
    mediation_name: ctx.mediation_name,
    site_url: ctx.site_url,
    currency: ctx.currency,
    vat_notice: ctx.vat_notice,
    vat_section: ctx.vat_section,
    rep_section: ctx.rep_section,
    mediation_section: ctx.mediation_section,
    rcs_section: ctx.rcs_section,
    payment_method: ctx.payment_method,
    delivery_method: ctx.delivery_method,
    shipping_info: ctx.shipping_info,
    delivery_delays_info: ctx.delivery_delays_info,
    withdrawal_info: ctx.withdrawal_info,
    return_info: ctx.return_info,
    exchange_section: ctx.exchange_section,
    analytics_section: ctx.analytics_section,
    recipients_section: ctx.recipients_section,
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  return html;
}
