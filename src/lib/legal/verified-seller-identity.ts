/**
 * Identité vendeuse vérifiée via recherche-entreprises.api.gouv.fr (15/06/2026).
 * Données publiques — ne pas inventer d'autres champs (téléphone, e-mail, médiateur, REP).
 */

export const VERIFIED_SELLER_IDENTITY = {
  siren: "104623848",
  siret: "10462384800017",
  /** Nom affiché dans l'annuaire public */
  publicName: "ALIZEE PELTIER",
  legalName: "Alizée Peltier",
  legalStatus: "Entrepreneur individuel (EI)",
  address: "1 impasse des Perrières, 44117 Saint-André-des-Eaux",
  activityCode: "47.91B",
  naf2025: "47.71Y",
  source: "recherche-entreprises.api.gouv.fr",
  verifiedAt: "2026-06-15",
} as const;

export const SELLER_IDENTITY_VERIFY_NOTICE =
  "Vérifiez ces informations avant publication.";

export type SellerIdentityFieldKey = "legalName" | "legalStatus" | "siret" | "address";

export interface SellerIdentityFields {
  legalName?: string | null;
  legalStatus?: string | null;
  siret?: string | null;
  address?: string | null;
}

export interface SellerIdentityDefaultsResult<T extends SellerIdentityFields> {
  values: T;
  /** Champs complétés depuis VERIFIED_SELLER_IDENTITY (pas encore en base). */
  suggestedFields: SellerIdentityFieldKey[];
}

function isBlank(value: string | null | undefined): boolean {
  return !value?.trim();
}

/**
 * Complète uniquement les champs d'identité vides — ne remplace jamais une valeur existante.
 */
export function withVerifiedSellerIdentityDefaults<T extends SellerIdentityFields>(
  fields: T,
): SellerIdentityDefaultsResult<T> {
  const values = { ...fields };
  const suggestedFields: SellerIdentityFieldKey[] = [];

  if (isBlank(values.legalName)) {
    values.legalName = VERIFIED_SELLER_IDENTITY.legalName;
    suggestedFields.push("legalName");
  }
  if (isBlank(values.legalStatus)) {
    values.legalStatus = VERIFIED_SELLER_IDENTITY.legalStatus;
    suggestedFields.push("legalStatus");
  }
  if (isBlank(values.siret)) {
    values.siret = VERIFIED_SELLER_IDENTITY.siret;
    suggestedFields.push("siret");
  }
  if (isBlank(values.address)) {
    values.address = VERIFIED_SELLER_IDENTITY.address;
    suggestedFields.push("address");
  }

  return { values, suggestedFields };
}

export function matchesVerifiedSellerIdentity(fields: SellerIdentityFields): boolean {
  const normalizedSiret = fields.siret?.replace(/\D/g, "") ?? "";
  return (
    fields.legalName?.trim() === VERIFIED_SELLER_IDENTITY.legalName &&
    fields.legalStatus?.trim() === VERIFIED_SELLER_IDENTITY.legalStatus &&
    normalizedSiret === VERIFIED_SELLER_IDENTITY.siret &&
    fields.address?.trim() === VERIFIED_SELLER_IDENTITY.address
  );
}
