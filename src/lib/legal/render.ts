import type { LegalRenderContext } from "@/lib/legal/context";
import { getDefaultLegalTemplate } from "@/lib/legal/templates";

const PLACEHOLDER_CONTENT_MARKERS = [
  "Contenu à compléter",
  "Contenu à initialiser",
  "<p>Contenu à compléter",
];

export function isPlaceholderLegalContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_CONTENT_MARKERS.some((m) => trimmed.includes(m));
}

export function resolveLegalPageHtml(
  slug: string,
  storedContent: string | null | undefined,
  ctx: LegalRenderContext,
): string {
  const template = getDefaultLegalTemplate(slug);
  let content = storedContent?.trim() ?? "";

  if (!content || isPlaceholderLegalContent(content)) {
    content = template?.content ?? content;
  }

  return renderLegalContent(content, ctx);
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
    site_url: ctx.site_url,
    currency: ctx.currency,
    vat_notice: ctx.vat_notice,
    vat_section: ctx.vat_section,
    rep_section: ctx.rep_section,
    mediation_section: ctx.mediation_section,
    payment_method: ctx.payment_method,
    delivery_method: ctx.delivery_method,
    shipping_info: ctx.shipping_info,
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  return html;
}
