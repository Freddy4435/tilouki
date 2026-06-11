import "server-only";

import { siteConfig } from "@/lib/constants/site";
import { getShopSettings } from "@/lib/supabase/queries/shop";
import type { ShopSettings } from "@/lib/shop/types";

export type LegalContextAudience = "public" | "admin";

export interface LegalRenderContext {
  shop_name: string;
  legal_name: string;
  legal_status: string;
  siret: string;
  address: string;
  email: string;
  phone: string;
  host_name: string;
  host_address: string;
  host_phone: string;
  host_email: string;
  mediation_name: string;
  site_url: string;
  currency: string;
  vat_notice: string;
  vat_section: string;
  rep_section: string;
  mediation_section: string;
  payment_method: string;
  delivery_method: string;
  shipping_info: string;
  withdrawal_info: string;
  return_info: string;
  exchange_section: string;
  analytics_section: string;
  recipients_section: string;
}

const ADMIN_PLACEHOLDER = (label: string) => `[À renseigner : ${label}]`;

const DEFAULT_VAT_NOTICE =
  "TVA non applicable, article 293 B du Code général des impôts (franchise en base de TVA).";

const DEFAULT_WITHDRAWAL =
  "Vous disposez d'un délai de 14 jours calendaires à compter de la réception des produits pour exercer votre droit de rétractation, sans avoir à justifier de motifs. Les articles doivent être retournés non portés, non lavés, dans leur emballage d'origine avec étiquettes intactes.";

const DEFAULT_RETURN =
  "Les frais de retour sont à la charge du client, sauf produit non conforme ou erreur du Vendeur. Le remboursement est effectué via le même moyen de paiement, dans un délai maximal de 14 jours après réception et contrôle du retour.";

const DEFAULT_EXCHANGE =
  "Pour un échange de taille, effectuez un retour puis passez une nouvelle commande sur le site, sous réserve de disponibilité du stock.";

const DEFAULT_PAYMENT =
  "Le paiement s'effectue en ligne par carte bancaire (Visa, Mastercard, etc.) via la plateforme sécurisée Stripe. Les données bancaires sont traitées directement par Stripe ; le Vendeur n'a pas accès aux numéros de carte complets.";

const DEFAULT_DELIVERY =
  "Les commandes sont expédiées depuis la France en point relais (Mondial Relay et/ou Chronopost selon votre choix au checkout), en France métropolitaine uniquement.";

const DEFAULT_SHIPPING =
  "Les frais de livraison sont calculés automatiquement selon le poids total des articles et affichés en euros (€) avant validation définitive de la commande.";

function fieldValue(
  value: string | null | undefined,
  adminLabel: string,
  audience: LegalContextAudience,
): string {
  const trimmed = value?.trim();
  if (trimmed) return trimmed;
  return audience === "admin" ? ADMIN_PLACEHOLDER(adminLabel) : "";
}

export function buildLegalContext(
  settings: ShopSettings | null,
  audience: LegalContextAudience = "public",
): LegalRenderContext {
  const shopName = settings?.name ?? siteConfig.name;
  const vatEnabled = settings?.vatEnabled ?? false;
  const vatNotice =
    settings?.vatNotice?.trim() ||
    (vatEnabled
      ? audience === "admin"
        ? ADMIN_PLACEHOLDER("mention TVA si vous êtes assujetti")
        : DEFAULT_VAT_NOTICE
      : DEFAULT_VAT_NOTICE);

  const repIdu = settings?.repIdu?.trim();
  const mediationName = settings?.mediationName?.trim();
  const mediationUrl = settings?.mediationUrl?.trim();
  const analyticsEnabled = settings?.analyticsEnabled ?? false;

  const mediationSection =
    mediationName && mediationUrl
      ? `<p>Conformément aux articles L612-1 et suivants du Code de la consommation, en cas de litige non résolu avec le Vendeur, vous pouvez saisir gratuitement le médiateur de la consommation suivant : <strong>${mediationName}</strong> — <a href="${mediationUrl}" rel="noopener noreferrer">${mediationUrl}</a>.</p>`
      : audience === "admin"
        ? `<p><strong>Médiation de la consommation :</strong> ${ADMIN_PLACEHOLDER("nom et URL du médiateur dans Paramètres boutique")}</p>`
        : "";

  const repSection = repIdu
    ? `<p><strong>Éco-participation / REP textile :</strong> identifiant unique (IDU) : ${repIdu}.</p>`
    : audience === "admin"
      ? `<p><strong>Éco-participation / REP textile :</strong> ${ADMIN_PLACEHOLDER("identifiant unique REP si vous êtes inscrit à un éco-organisme textile")}</p>`
      : `<p class="legal-review"><em>À valider avec un professionnel du droit :</em> si vous êtes producteur de textiles, vérifiez vos obligations REP et l'affichage de l'éco-participation.</p>`;

  const analyticsSection = analyticsEnabled
    ? `<p>Des cookies de mesure d'audience peuvent être déposés <strong>uniquement après votre consentement</strong> via le bandeau cookies. Vous pouvez retirer votre consentement à tout moment en supprimant les cookies du site dans votre navigateur.</p>
<p class="legal-review"><em>À valider avec un professionnel du droit :</em> précisez ici le nom de l'outil analytics utilisé (ex. Plausible, Matomo) et sa politique de confidentialité.</p>`
    : `<p>Aucun outil de mesure d'audience tiers n'est utilisé sur ce site à ce jour. Seuls les cookies strictement nécessaires au fonctionnement de la boutique et ceux liés au paiement sécurisé (Stripe) sont déposés.</p>`;

  const exchangePolicy = settings?.exchangePolicy?.trim() || DEFAULT_EXCHANGE;
  const exchangeSection = `<p>${exchangePolicy}</p>`;

  const recipientsSection = `<ul>
  <li><strong>Stripe</strong> — traitement des paiements</li>
  <li><strong>Mondial Relay</strong> — livraison en point relais</li>
  <li><strong>Chronopost</strong> — livraison en point relais (selon transporteur choisi)</li>
  <li><strong>${fieldValue(settings?.hostName, "nom de l'hébergeur", audience) || "Hébergeur du site"}</strong> — hébergement</li>
  <li><strong>Resend ou SMTP</strong> — envoi des e-mails transactionnels</li>
</ul>`;

  return {
    shop_name: shopName,
    legal_name: fieldValue(settings?.legalName, "nom légal ou raison sociale", audience),
    legal_status: fieldValue(settings?.legalStatus, "statut juridique, ex. Auto-entrepreneur", audience),
    siret: fieldValue(settings?.siret, "numéro SIRET à 14 chiffres", audience),
    address: fieldValue(settings?.address, "adresse professionnelle complète", audience),
    email: fieldValue(settings?.contactEmail, "adresse e-mail de contact", audience),
    phone: fieldValue(settings?.phone, "numéro de téléphone", audience),
    host_name: fieldValue(settings?.hostName, "nom de l'hébergeur", audience),
    host_address: fieldValue(settings?.hostAddress, "adresse de l'hébergeur", audience),
    host_phone: fieldValue(settings?.hostPhone, "téléphone de l'hébergeur", audience),
    host_email: fieldValue(settings?.hostEmail, "e-mail de l'hébergeur", audience),
    mediation_name: mediationName || fieldValue(null, "nom du médiateur", audience),
    site_url: siteConfig.url,
    currency: settings?.currency ?? "EUR",
    vat_notice: vatNotice,
    vat_section: vatNotice ? `<p><strong>TVA :</strong> ${vatNotice}</p>` : "",
    rep_section: repSection,
    mediation_section: mediationSection,
    payment_method: DEFAULT_PAYMENT,
    delivery_method: DEFAULT_DELIVERY,
    shipping_info: DEFAULT_SHIPPING,
    withdrawal_info: settings?.returnPolicy?.trim() || DEFAULT_WITHDRAWAL,
    return_info:
      settings?.returnPolicy?.trim() ||
      (audience === "admin" ? ADMIN_PLACEHOLDER("politique retours dans Paramètres boutique") : DEFAULT_RETURN),
    exchange_section: exchangeSection,
    analytics_section: analyticsSection,
    recipients_section: recipientsSection,
  };
}

export async function getLegalRenderContext(
  audience: LegalContextAudience = "public",
): Promise<LegalRenderContext> {
  const settings = await getShopSettings();
  return buildLegalContext(settings, audience);
}
