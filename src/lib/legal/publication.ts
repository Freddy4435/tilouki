import "server-only";

import type { LegalComplianceInput } from "@/lib/legal/compliance";
import { getLegalComplianceSummary } from "@/lib/legal/compliance";
import { buildLegalContext } from "@/lib/legal/context";
import {
  containsPublicLegalPlaceholder,
  finalizePublicLegalHtml,
  isPlaceholderLegalContent,
  renderLegalContent,
  resolveLegalPageHtml,
} from "@/lib/legal/render";
import {
  LEGAL_PAGE_LABELS,
  LEGAL_PAGE_SLUGS,
  getDefaultLegalTemplate,
} from "@/lib/legal/templates";
import type { ShopSettings } from "@/lib/shop/types";
import { getLegalPage } from "@/lib/supabase/queries/legal";

const SHOP_LEGAL_ONLY = { includeInfrastructure: false } as const;

export const LEGAL_PUBLICATION_BLOCK_MESSAGE =
  "La boutique finalise ses informations légales. Les commandes reprendront sous peu.";

export interface CheckoutLegalBlocker {
  id: string;
  label: string;
  hint?: string;
}

export function shopSettingsToComplianceInput(
  settings: ShopSettings | null,
): LegalComplianceInput | null {
  if (!settings) return null;

  return {
    shopName: settings.name,
    legalName: settings.legalName,
    legalStatus: settings.legalStatus,
    siret: settings.siret,
    address: settings.address,
    email: settings.contactEmail,
    phone: settings.phone,
    vatEnabled: settings.vatEnabled,
    vatNotice: settings.vatNotice,
    mediationName: settings.mediationName,
    mediationUrl: settings.mediationUrl,
    repIdu: settings.repIdu,
    hostName: settings.hostName,
    hostAddress: settings.hostAddress,
    hostPhone: settings.hostPhone,
    hostEmail: settings.hostEmail,
    returnPolicy: settings.returnPolicy,
    exchangePolicy: settings.exchangePolicy,
    analyticsEnabled: settings.analyticsEnabled,
  };
}

export function isLegalPublicationReady(settings: ShopSettings | null): boolean {
  const summary = getLegalComplianceSummary(
    shopSettingsToComplianceInput(settings),
    SHOP_LEGAL_ONLY,
  );
  return summary.isComplete;
}

export function getLegalPublicationMissingLabels(
  settings: ShopSettings | null,
): string[] {
  const summary = getLegalComplianceSummary(
    shopSettingsToComplianceInput(settings),
    SHOP_LEGAL_ONLY,
  );
  return summary.missingRequired.map((item) => item.label);
}

/** Liste les blocages checkout (paramètres boutique + pages publiables). */
export async function getCheckoutLegalBlockers(
  settings: ShopSettings | null,
): Promise<CheckoutLegalBlocker[]> {
  const blockers: CheckoutLegalBlocker[] = [];

  const summary = getLegalComplianceSummary(
    shopSettingsToComplianceInput(settings),
    SHOP_LEGAL_ONLY,
  );
  for (const item of summary.missingRequired) {
    blockers.push({
      id: item.id,
      label: item.label,
      hint: item.hint,
    });
  }

  for (const slug of LEGAL_PAGE_SLUGS) {
    const page = await getLegalPage(slug);
    const html = renderSafePublicLegalHtml(slug, page?.content, settings);
    if (!html) {
      blockers.push({
        id: `legal-page-${slug}`,
        label: LEGAL_PAGE_LABELS[slug],
        hint: "Complétez et enregistrez la page — aucun texte provisoire ne doit rester en ligne",
      });
    }
  }

  return blockers;
}

/** Vérifie paramètres boutique + contenu légal publiable (pages en base). */
export async function isCheckoutLegalReady(
  settings: ShopSettings | null,
): Promise<boolean> {
  const blockers = await getCheckoutLegalBlockers(settings);
  return blockers.length === 0;
}

/** Vérifie que chaque page légale rendue ne contient aucun marqueur placeholder public. */
export function auditPublicLegalPages(settings: ShopSettings | null): {
  ok: boolean;
  failures: { slug: string; reason: string }[];
} {
  const ctx = buildLegalContext(settings, "public");
  const failures: { slug: string; reason: string }[] = [];

  for (const slug of LEGAL_PAGE_SLUGS) {
    const template = getDefaultLegalTemplate(slug);
    const stored = "";
    const html = resolveLegalPageHtml(slug, stored, ctx, { audience: "public" });

    if (containsPublicLegalPlaceholder(html)) {
      failures.push({
        slug,
        reason: "Marqueur placeholder détecté après rendu public",
      });
      continue;
    }

    if (template && isPlaceholderLegalContent(template.content)) {
      failures.push({ slug, reason: "Modèle par défaut encore en placeholder" });
    }
  }

  return { ok: failures.length === 0, failures };
}

export function renderSafePublicLegalHtml(
  slug: string,
  storedContent: string | null | undefined,
  settings: ShopSettings | null,
): string | null {
  const ctx = buildLegalContext(settings, "public");
  let content = storedContent?.trim() ?? "";
  const template = getDefaultLegalTemplate(slug);

  if (!content || isPlaceholderLegalContent(content)) {
    content = template?.content ?? content;
  }

  if (!content.trim()) return null;

  const rendered = finalizePublicLegalHtml(renderLegalContent(content, ctx));

  if (containsPublicLegalPlaceholder(rendered)) {
    return null;
  }

  return rendered;
}
