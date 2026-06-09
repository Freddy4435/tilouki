import "server-only";

import { siteConfig } from "@/lib/constants/site";
import { getShopSettings } from "@/lib/supabase/queries/shop";
import type { ShopSettings } from "@/lib/shop/types";

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
  site_url: string;
  currency: string;
  vat_notice: string;
  vat_section: string;
  rep_section: string;
  mediation_section: string;
  payment_method: string;
  delivery_method: string;
  shipping_info: string;
}

const PLACEHOLDER = (label: string) => `[À PERSONNALISER : ${label}]`;

export function buildLegalContext(settings: ShopSettings | null): LegalRenderContext {
  const shopName = settings?.name ?? siteConfig.name;
  const vatEnabled = settings?.vatEnabled ?? false;
  const vatNotice =
    settings?.vatNotice?.trim() ||
    (vatEnabled
      ? PLACEHOLDER("mention TVA applicable si vous êtes assujetti")
      : "TVA non applicable, art. 293 B du CGI");

  const repIdu = settings?.repIdu?.trim();
  const mediationUrl = settings?.mediationUrl?.trim();

  return {
    shop_name: shopName,
    legal_name: settings?.legalName?.trim() || PLACEHOLDER("nom et prénom ou dénomination commerciale"),
    legal_status: settings?.legalStatus?.trim() || PLACEHOLDER("statut — ex. auto-entrepreneur"),
    siret: settings?.siret?.trim() || PLACEHOLDER("numéro SIRET"),
    address: settings?.address?.trim() || PLACEHOLDER("adresse professionnelle complète"),
    email: settings?.contactEmail?.trim() || PLACEHOLDER("adresse e-mail de contact"),
    phone: settings?.phone?.trim() || PLACEHOLDER("numéro de téléphone"),
    host_name: settings?.hostName?.trim() || PLACEHOLDER("nom de l'hébergeur"),
    host_address: settings?.hostAddress?.trim() || PLACEHOLDER("adresse de l'hébergeur"),
    host_phone: settings?.hostPhone?.trim() || PLACEHOLDER("téléphone de l'hébergeur"),
    site_url: siteConfig.url,
    currency: settings?.currency ?? "EUR",
    vat_notice: vatNotice,
    vat_section: `<p><strong>TVA :</strong> ${vatNotice}</p>`,
    rep_section: repIdu
      ? `<p><strong>Identifiant unique (REP) textile :</strong> ${repIdu}</p>`
      : "",
    mediation_section: mediationUrl
      ? `<p><strong>Médiation de la consommation :</strong> en cas de litige non résolu, vous pouvez saisir le médiateur suivant : <a href="${mediationUrl}" rel="noopener noreferrer">${mediationUrl}</a>.</p>`
      : `<p><strong>Médiation de la consommation :</strong> ${PLACEHOLDER("indiquer le médiateur de la consommation compétent et son URL — voir paramètres boutique")}</p>`,
    payment_method:
      "Paiement sécurisé par carte bancaire via Stripe (plateforme de paiement tierce).",
    delivery_method: "Livraison en point relais Mondial Relay (France métropolitaine).",
    shipping_info:
      "Les frais de livraison sont calculés selon le poids du colis et affichés en euros (€) avant validation de la commande.",
  };
}

export async function getLegalRenderContext(): Promise<LegalRenderContext> {
  const settings = await getShopSettings();
  return buildLegalContext(settings);
}
