/** Vérification des informations légales obligatoires — ne remplace pas un avis juridique. */



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

}



export interface LegalComplianceItem {

  id: string;

  label: string;

  group: "identite" | "fiscalite" | "hebergement" | "mediation" | "retours" | "rep";

  required: boolean;

  filled: boolean;

  hint?: string;

}



function filled(value: string | null | undefined): boolean {

  return Boolean(value?.trim());

}



export function buildLegalComplianceItems(

  settings: LegalComplianceInput | null,

): LegalComplianceItem[] {

  const s = settings ?? {};

  const vatEnabled = s.vatEnabled ?? false;



  return [

    {

      id: "shopName",

      label: "Nom commercial",

      group: "identite",

      required: true,

      filled: filled(s.shopName),

      hint: "Nom affiché sur le site (ex. Tilouki)",

    },

    {

      id: "legalName",

      label: "Nom légal / raison sociale",

      group: "identite",

      required: true,

      filled: filled(s.legalName),

      hint: "Nom et prénom ou dénomination de l'auto-entrepreneur",

    },

    {

      id: "legalStatus",

      label: "Statut juridique",

      group: "identite",

      required: true,

      filled: filled(s.legalStatus),

      hint: "Ex. Auto-entrepreneur, EURL, SASU…",

    },

    {

      id: "siret",

      label: "SIRET",

      group: "identite",

      required: true,

      filled: filled(s.siret),

      hint: "14 chiffres — ne pas inventer de numéro",

    },

    {

      id: "address",

      label: "Adresse professionnelle",

      group: "identite",

      required: true,

      filled: filled(s.address),

    },

    {

      id: "email",

      label: "E-mail de contact",

      group: "identite",

      required: true,

      filled: filled(s.email),

    },

    {

      id: "phone",

      label: "Téléphone",

      group: "identite",

      required: true,

      filled: filled(s.phone),

    },

    {

      id: "vatNotice",

      label: "Mention TVA",

      group: "fiscalite",

      required: vatEnabled,

      filled: filled(s.vatNotice),

      hint: vatEnabled

        ? "Obligatoire si vous êtes assujetti à la TVA"

        : "Franchise en base : mention par défaut si vide",

    },

    {

      id: "hostName",

      label: "Hébergeur — nom",

      group: "hebergement",

      required: true,

      filled: filled(s.hostName),

      hint: "Ex. Vercel Inc.",

    },

    {

      id: "hostAddress",

      label: "Hébergeur — adresse",

      group: "hebergement",

      required: true,

      filled: filled(s.hostAddress),

    },

    {

      id: "hostEmail",

      label: "Hébergeur — e-mail",

      group: "hebergement",

      required: true,

      filled: filled(s.hostEmail),

    },

    {

      id: "hostPhone",

      label: "Hébergeur — téléphone",

      group: "hebergement",

      required: false,

      filled: filled(s.hostPhone),

    },

    {

      id: "mediationName",

      label: "Médiateur de la consommation — nom",

      group: "mediation",

      required: true,

      filled: filled(s.mediationName),

      hint: "Ex. médiateur sectoriel ou plateforme agréée",

    },

    {

      id: "mediationUrl",

      label: "Médiateur — URL",

      group: "mediation",

      required: true,

      filled: filled(s.mediationUrl),

    },

    {

      id: "returnPolicy",

      label: "Politique retours / rétractation",

      group: "retours",

      required: true,

      filled: filled(s.returnPolicy),

      hint: "Frais de retour, délais de remboursement, conditions des articles",

    },

    {

      id: "exchangePolicy",

      label: "Politique échange de taille",

      group: "retours",

      required: false,

      filled: filled(s.exchangePolicy),

      hint: "Recommandé pour une boutique vêtements enfants",

    },

    {

      id: "repIdu",

      label: "IDU REP textile",

      group: "rep",

      required: false,

      filled: filled(s.repIdu),

      hint: "Recommandé pour la vente de vêtements en France — à valider selon votre situation",

    },

  ];

}



export function getLegalComplianceSummary(settings: LegalComplianceInput | null) {

  const items = buildLegalComplianceItems(settings);

  const missingRequired = items.filter((i) => i.required && !i.filled);

  const missingRecommended = items.filter((i) => !i.required && !i.filled);

  return {

    items,

    missingRequired,

    missingRecommended,

    isComplete: missingRequired.length === 0,

    requiredCount: items.filter((i) => i.required).length,

    filledRequiredCount: items.filter((i) => i.required && i.filled).length,

  };

}


