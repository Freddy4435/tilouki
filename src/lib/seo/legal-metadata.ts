import type { Metadata } from "next";

import { LIVRAISON_SEO_DESCRIPTION } from "@/lib/seo/copy";
import { buildPageMetadata } from "@/lib/seo/metadata";

export function buildLegalPageMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  return buildPageMetadata({ title, description, path });
}

export const legalMetadata = {
  mentionsLegales: buildLegalPageMetadata(
    "/mentions-legales",
    "Mentions légales",
    "Informations légales sur l'éditeur du site, l'hébergement et la propriété intellectuelle.",
  ),
  cgv: buildLegalPageMetadata(
    "/cgv",
    "Conditions générales de vente",
    "Modalités de commande, paiement, livraison en point relais, rétractation et garanties.",
  ),
  confidentialite: buildLegalPageMetadata(
    "/confidentialite",
    "Politique de confidentialité",
    "Comment nous collectons, utilisons et protégeons vos données personnelles.",
  ),
  cookies: buildLegalPageMetadata(
    "/cookies",
    "Politique de cookies",
    "Types de cookies utilisés sur le site et comment les gérer.",
  ),
  livraisonRetours: buildLegalPageMetadata(
    "/livraison-retours",
    "Livraison et retours",
    LIVRAISON_SEO_DESCRIPTION,
  ),
  formulaireRetractation: buildLegalPageMetadata(
    "/formulaire-retractation",
    "Formulaire de rétractation",
    "Formulaire type pour exercer votre droit de rétractation sous 14 jours.",
  ),
} as const;
