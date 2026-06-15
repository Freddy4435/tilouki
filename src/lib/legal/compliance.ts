import { isPlaceholderLegalContent } from "@/lib/legal/render";
import {
  LEGAL_PAGE_LABELS,
  LEGAL_PAGE_SLUGS,
  getDefaultLegalTemplate,
  type LegalPageSlug,
} from "@/lib/legal/templates";

const LEGAL_PAGE_HINTS: Partial<Record<LegalPageSlug, string>> = {
  "mentions-legales": "Identité vendeur, SIRET, hébergeur, contact",
  cgv: "Vente, paiement, garanties légales de conformité et vices cachés",
  confidentialite:
    "RGPD : finalités, bases légales, droits des personnes, DPO si applicable",
  cookies: "Types de cookies, finalités et gestion du consentement",
  "livraison-retours": "Délais, zones, frais de livraison, retours et remboursements",
  "formulaire-retractation": "Modèle de rétractation (14 jours) — à personnaliser",
};

export interface LegalComplianceInput {
  shopName?: string | null;
  legalName?: string | null;
  legalStatus?: string | null;
  siret?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  vatNotice?: string | null;
  vatEnabled?: boolean;
  mediationName?: string | null;
  mediationUrl?: string | null;
  repIdu?: string | null;
  hostName?: string | null;
  hostAddress?: string | null;
  hostPhone?: string | null;
  hostEmail?: string | null;
  returnPolicy?: string | null;
  exchangePolicy?: string | null;
  analyticsEnabled?: boolean;
  /** Pages légales en base (contenu brut admin). */
  legalPages?: Array<{ slug: string; content: string }>;
  /** Tranches Mondial Relay actives — frais affichés au checkout. */
  activeShippingRateCount?: number;
}

export type LegalComplianceGroup =
  | "identite"
  | "fiscalite"
  | "hebergement"
  | "mediation"
  | "retours"
  | "livraison"
  | "rep"
  | "pages"
  | "infrastructure"
  | "juridique";

export type LegalComplianceTier = "required" | "recommended" | "legalReview";

export interface LegalComplianceItem {
  id: string;
  label: string;
  group: LegalComplianceGroup;
  /** @deprecated Préférer tier — conservé pour compatibilité tests */
  required: boolean;
  tier: LegalComplianceTier;
  filled: boolean;
  hint?: string;
}

export function isUpstashRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

export function isMondialRelayProductionConfigured(): boolean {
  return Boolean(
    process.env.MONDIAL_RELAY_ENSEIGNE?.trim() &&
    process.env.MONDIAL_RELAY_PRIVATE_KEY?.trim(),
  );
}

function buildInfrastructureComplianceItems(): LegalComplianceItem[] {
  return [
    item({
      id: "upstashRateLimit",
      label: "Rate limiting Upstash configuré",
      group: "infrastructure",
      tier: "required",
      filled: isUpstashRateLimitConfigured(),
      hint: "Variables UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN sur l'hébergement de production",
    }),
    item({
      id: "mondialRelayProduction",
      label: "Mondial Relay production configuré",
      group: "infrastructure",
      tier: "required",
      filled: isMondialRelayProductionConfigured(),
      hint: "Variables MONDIAL_RELAY_ENSEIGNE et MONDIAL_RELAY_PRIVATE_KEY sur Vercel",
    }),
  ];
}

function filled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function item(
  partial: Omit<LegalComplianceItem, "required" | "tier"> & {
    tier: LegalComplianceTier;
  },
): LegalComplianceItem {
  return {
    ...partial,
    required: partial.tier === "required",
  };
}

function buildLegalReviewComplianceItems(
  settings: LegalComplianceInput | null,
): LegalComplianceItem[] {
  const s = settings ?? {};
  const items: LegalComplianceItem[] = [
    item({
      id: "legal-review-global",
      label: "Relecture juridique avant publication définitive",
      group: "juridique",
      tier: "legalReview",
      filled: false,
      hint: "Base structurée (Service Public, CNIL) — faites valider par la vendeuse ou un professionnel du droit.",
    }),
  ];

  for (const slug of LEGAL_PAGE_SLUGS) {
    const template = getDefaultLegalTemplate(slug);
    if (!template) continue;
    const markerCount = (template.content.match(/class="legal-review"/g) ?? []).length;
    if (markerCount === 0) continue;

    items.push(
      item({
        id: `legal-review-${slug}`,
        label: `${LEGAL_PAGE_LABELS[slug]} — passages à valider`,
        group: "juridique",
        tier: "legalReview",
        filled: false,
        hint: `${markerCount} passage(s) « À valider avec un professionnel du droit » dans le modèle.`,
      }),
    );
  }

  if (s.analyticsEnabled) {
    items.push(
      item({
        id: "legal-review-analytics",
        label: "Cookies — outil de mesure d'audience",
        group: "juridique",
        tier: "legalReview",
        filled: false,
        hint: "CNIL : nommer l'outil, finalité, durée de conservation et lien vers sa politique.",
      }),
    );
  }

  if (!s.repIdu?.trim()) {
    items.push(
      item({
        id: "legal-review-rep-textile",
        label: "REP textile — éco-organisme et affichage",
        group: "juridique",
        tier: "legalReview",
        filled: false,
        hint: "Service Public F37937 : vérifiez l'adhésion à Refashion et l'affichage de l'IDU le cas échéant.",
      }),
    );
  }

  return items;
}

function buildLegalPageComplianceItems(
  legalPages: Array<{ slug: string; content: string }> | undefined,
  analyticsEnabled: boolean,
): LegalComplianceItem[] {
  if (!legalPages) return [];

  const bySlug = new Map(legalPages.map((page) => [page.slug, page]));
  const items: LegalComplianceItem[] = [];

  for (const slug of LEGAL_PAGE_SLUGS) {
    const page = bySlug.get(slug);
    const content = page?.content ?? "";
    items.push(
      item({
        id: `legal-page-${slug}`,
        label: LEGAL_PAGE_LABELS[slug],
        group: "pages",
        tier: "required",
        filled: Boolean(content.trim()) && !isPlaceholderLegalContent(content),
        hint:
          LEGAL_PAGE_HINTS[slug] ??
          "Pages légales — relisez le texte, complétez les passages « À valider » et enregistrez",
      }),
    );
  }

  if (analyticsEnabled) {
    const cookies = bySlug.get("cookies");
    const cookiesContent = cookies?.content ?? "";
    const cookiesFilled =
      Boolean(cookiesContent.trim()) && !isPlaceholderLegalContent(cookiesContent);
    const cookiesItem = items.find((i) => i.id === "legal-page-cookies");
    if (cookiesItem && !cookiesFilled) {
      cookiesItem.hint =
        "Analytics activé : précisez l'outil de mesure et le dépôt après consentement";
    }
  }

  return items;
}

export function getLegalComplianceAction(item: LegalComplianceItem): {
  href: string;
  label: string;
} {
  if (item.group === "pages" || item.id.startsWith("legal-page-")) {
    return { href: "/admin/pages-legales", label: "Pages légales" };
  }
  if (item.group === "juridique" || item.id.startsWith("legal-review-")) {
    return { href: "/admin/pages-legales", label: "Pages légales" };
  }
  if (item.group === "livraison" || item.id === "activeShippingRates") {
    return { href: "/admin/livraison", label: "Livraison" };
  }
  return { href: "/admin/parametres", label: "Paramètres boutique" };
}

export function buildLegalComplianceItems(
  settings: LegalComplianceInput | null,
  options?: { includeInfrastructure?: boolean },
): LegalComplianceItem[] {
  const s = settings ?? {};
  const vatEnabled = s.vatEnabled ?? false;
  const includeInfrastructure = options?.includeInfrastructure ?? true;

  const shopItems: LegalComplianceItem[] = [
    item({
      id: "shopName",
      label: "Nom commercial",
      group: "identite",
      tier: "required",
      filled: filled(s.shopName),
      hint: "Paramètres → Identité — nom affiché sur le site",
    }),
    item({
      id: "legalName",
      label: "Nom légal / raison sociale",
      group: "identite",
      tier: "required",
      filled: filled(s.legalName),
      hint: "Paramètres → Identité — nom et prénom ou dénomination",
    }),
    item({
      id: "legalStatus",
      label: "Statut juridique",
      group: "identite",
      tier: "required",
      filled: filled(s.legalStatus),
      hint: "Ex. Auto-entrepreneur, EURL, SASU…",
    }),
    item({
      id: "siret",
      label: "SIRET",
      group: "identite",
      tier: "required",
      filled: filled(s.siret),
      hint: "14 chiffres (les 9 premiers = SIREN) — ne pas inventer de numéro",
    }),
    item({
      id: "address",
      label: "Adresse professionnelle",
      group: "identite",
      tier: "required",
      filled: filled(s.address),
      hint: "Adresse figurant sur les documents officiels",
    }),
    item({
      id: "email",
      label: "E-mail de contact",
      group: "identite",
      tier: "required",
      filled: filled(s.email),
      hint: "Adresse consultée par les clients et pour les réclamations",
    }),
    item({
      id: "phone",
      label: "Téléphone",
      group: "identite",
      tier: "required",
      filled: filled(s.phone),
      hint: "Numéro joignable pour le service client",
    }),
    item({
      id: "vatNotice",
      label: "Mention TVA",
      group: "fiscalite",
      tier: vatEnabled ? "required" : "recommended",
      filled: filled(s.vatNotice),
      hint: vatEnabled
        ? "Obligatoire si vous êtes assujetti à la TVA"
        : "Franchise en base : mention par défaut si vide",
    }),
    item({
      id: "hostName",
      label: "Hébergeur — nom",
      group: "hebergement",
      tier: "required",
      filled: filled(s.hostName),
      hint: "Ex. Vercel Inc. — mentions légales",
    }),
    item({
      id: "hostAddress",
      label: "Hébergeur — adresse",
      group: "hebergement",
      tier: "required",
      filled: filled(s.hostAddress),
    }),
    item({
      id: "hostEmail",
      label: "Hébergeur — e-mail",
      group: "hebergement",
      tier: "required",
      filled: filled(s.hostEmail),
    }),
    item({
      id: "hostPhone",
      label: "Hébergeur — téléphone",
      group: "hebergement",
      tier: "recommended",
      filled: filled(s.hostPhone),
      hint: "Recommandé si communiqué par l'hébergeur",
    }),
    item({
      id: "mediationName",
      label: "Médiateur de la consommation — nom",
      group: "mediation",
      tier: "required",
      filled: filled(s.mediationName),
      hint: "Médiateur agréé — voir liste CECMC (economie.gouv.fr/cecmc). Ne pas inventer de médiateur.",
    }),
    item({
      id: "mediationUrl",
      label: "Médiateur — URL",
      group: "mediation",
      tier: "required",
      filled: filled(s.mediationUrl),
      hint: "Lien vers la plateforme de saisine du médiateur",
    }),
    item({
      id: "returnPolicy",
      label: "Retours, rétractation et remboursements",
      group: "retours",
      tier: "required",
      filled: filled(s.returnPolicy),
      hint: "Délais, frais de retour, conditions d'état des articles, délai de remboursement",
    }),
    item({
      id: "exchangePolicy",
      label: "Échanges de taille",
      group: "retours",
      tier: "recommended",
      filled: filled(s.exchangePolicy),
      hint: "Recommandé pour une boutique vêtements enfants",
    }),
    item({
      id: "repIdu",
      label: "IDU REP textile",
      group: "rep",
      tier: "recommended",
      filled: filled(s.repIdu),
      hint: "IDU délivré par Refashion / ADEME si adhérent éco-organisme textile — ne pas inventer",
    }),
  ];

  const deliveryItems: LegalComplianceItem[] =
    typeof s.activeShippingRateCount === "number"
      ? [
          item({
            id: "activeShippingRates",
            label: "Barème livraison actif (frais au checkout)",
            group: "livraison",
            tier: "required",
            filled: s.activeShippingRateCount > 0,
            hint: "Livraison → au moins une tranche Mondial Relay active (délais et frais affichés)",
          }),
        ]
      : [];

  const pageItems = buildLegalPageComplianceItems(
    s.legalPages,
    s.analyticsEnabled ?? false,
  );
  const reviewItems = buildLegalReviewComplianceItems(s);

  if (includeInfrastructure) {
    return [
      ...shopItems,
      ...deliveryItems,
      ...pageItems,
      ...reviewItems,
      ...buildInfrastructureComplianceItems(),
    ];
  }

  return [...shopItems, ...deliveryItems, ...pageItems, ...reviewItems];
}

export function getLegalComplianceSummary(
  settings: LegalComplianceInput | null,
  options?: { includeInfrastructure?: boolean },
) {
  const items = buildLegalComplianceItems(settings, options);

  const saleItems = items.filter((i) => i.tier !== "legalReview");
  const missingRequired = saleItems.filter((i) => i.tier === "required" && !i.filled);
  const missingRecommended = saleItems.filter(
    (i) => i.tier === "recommended" && !i.filled,
  );
  const pendingLegalReview = items.filter((i) => i.tier === "legalReview" && !i.filled);

  return {
    items,
    missingRequired,
    missingRecommended,
    pendingLegalReview,
    isComplete: missingRequired.length === 0,
    requiredCount: saleItems.filter((i) => i.tier === "required").length,
    filledRequiredCount: saleItems.filter((i) => i.tier === "required" && i.filled)
      .length,
  };
}
