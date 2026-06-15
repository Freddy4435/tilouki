import { z } from "zod";

export const COMPANY_LOOKUP_TIMEOUT_MS = 8_000;

export const COMPANY_LOOKUP_API_URL =
  "https://recherche-entreprises.api.gouv.fr/search";

const siretDigitsSchema = z.string().regex(/^\d{14}$/, "SIRET invalide (14 chiffres).");

const establishmentSchema = z
  .object({
    siret: z.string().optional(),
    adresse: z.string().optional(),
    code_postal: z.string().optional(),
    libelle_commune: z.string().optional(),
    geo_adresse: z.string().optional(),
    activite_principale: z.string().optional(),
    statut_diffusion_etablissement: z.enum(["O", "N", "P"]).optional(),
  })
  .passthrough();

const companyResultSchema = z
  .object({
    siren: z.string().optional(),
    nom_complet: z.string().optional(),
    nom_raison_sociale: z.string().optional(),
    denomination: z.string().optional(),
    activite_principale: z.string().optional(),
    nature_juridique: z.string().optional(),
    statut_diffusion: z.enum(["O", "N", "P"]).optional(),
    siege: establishmentSchema.optional(),
    matching_etablissements: z.array(establishmentSchema).optional(),
    complements: z
      .object({
        est_entrepreneur_individuel: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

const apiResponseSchema = z
  .object({
    results: z.array(companyResultSchema),
    total_results: z.number().optional(),
  })
  .passthrough();

export type CompanyLookupErrorCode =
  | "invalid_siret"
  | "not_found"
  | "non_diffusible"
  | "api_unavailable";

export interface CompanyLookupSuccess {
  ok: true;
  legalName: string;
  address: string;
  apeCode: string | null;
  suggestedLegalStatus: string | null;
}

export interface CompanyLookupFailure {
  ok: false;
  code: CompanyLookupErrorCode;
  message: string;
}

export type CompanyLookupOutcome = CompanyLookupSuccess | CompanyLookupFailure;

const NATURE_JURIDIQUE_LABELS: Record<string, string> = {
  "1000": "Entrepreneur individuel",
  "5498": "Entreprise individuelle",
  "5499": "EURL",
  "5710": "SAS",
  "5720": "SASU",
  "6540": "SCI",
};

function normalizeSiret(raw: string): string {
  return raw.replace(/\D/g, "");
}

function formatEstablishmentAddress(
  establishment: z.infer<typeof establishmentSchema>,
): string {
  const geo = establishment.geo_adresse?.trim();
  if (geo) return geo;

  const line = establishment.adresse?.trim();
  const postal = establishment.code_postal?.trim();
  const city = establishment.libelle_commune?.trim();

  const parts = [line, [postal, city].filter(Boolean).join(" ")].filter(Boolean);
  return parts.join(", ");
}

function resolveLegalName(company: z.infer<typeof companyResultSchema>): string {
  return (
    company.nom_complet?.trim() ||
    company.nom_raison_sociale?.trim() ||
    company.denomination?.trim() ||
    ""
  );
}

function resolveApeCode(
  company: z.infer<typeof companyResultSchema>,
  establishment: z.infer<typeof establishmentSchema>,
): string | null {
  return (
    establishment.activite_principale?.trim() ||
    company.activite_principale?.trim() ||
    null
  );
}

function resolveSuggestedLegalStatus(
  company: z.infer<typeof companyResultSchema>,
): string | null {
  if (company.complements?.est_entrepreneur_individuel) {
    return "Auto-entrepreneur";
  }

  const code = company.nature_juridique?.trim();
  if (code && NATURE_JURIDIQUE_LABELS[code]) {
    return NATURE_JURIDIQUE_LABELS[code];
  }

  return null;
}

function isNonDiffusible(
  company: z.infer<typeof companyResultSchema>,
  establishment: z.infer<typeof establishmentSchema>,
): boolean {
  if (
    company.statut_diffusion === "N" ||
    establishment.statut_diffusion_etablissement === "N"
  ) {
    return true;
  }

  if (
    company.statut_diffusion === "P" ||
    establishment.statut_diffusion_etablissement === "P"
  ) {
    const legalName = resolveLegalName(company);
    const address = formatEstablishmentAddress(establishment);
    if (!legalName || !address) return true;
    if (/\[.*\]/i.test(legalName) || /\bnon diffus/i.test(legalName)) return true;
  }

  return false;
}

export function findEstablishmentBySiret(
  response: z.infer<typeof apiResponseSchema>,
  siret: string,
): {
  company: z.infer<typeof companyResultSchema>;
  establishment: z.infer<typeof establishmentSchema>;
} | null {
  for (const company of response.results) {
    if (company.siege?.siret === siret) {
      return { company, establishment: company.siege };
    }

    const match = company.matching_etablissements?.find((item) => item.siret === siret);
    if (match) {
      return { company, establishment: match };
    }
  }

  if (response.results.length === 1) {
    const company = response.results[0];
    const establishment = company.siege;
    if (establishment?.siret === siret) {
      return { company, establishment };
    }
  }

  return null;
}

export function mapCompanyLookupResponse(
  raw: unknown,
  siretInput: string,
): CompanyLookupOutcome {
  const siretParsed = siretDigitsSchema.safeParse(normalizeSiret(siretInput));
  if (!siretParsed.success) {
    return {
      ok: false,
      code: "invalid_siret",
      message: "Saisissez un numéro SIRET valide à 14 chiffres.",
    };
  }

  const siret = siretParsed.data;
  const parsed = apiResponseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "api_unavailable",
      message:
        "L'annuaire des entreprises est temporairement indisponible. Réessayez dans quelques instants ou complétez manuellement.",
    };
  }

  const match = findEstablishmentBySiret(parsed.data, siret);
  if (!match) {
    return {
      ok: false,
      code: "not_found",
      message:
        "Aucune entreprise trouvée pour ce SIRET. Vérifiez le numéro ou complétez les champs manuellement.",
    };
  }

  const { company, establishment } = match;

  if (isNonDiffusible(company, establishment)) {
    return {
      ok: false,
      code: "non_diffusible",
      message:
        "Cette entreprise limite la diffusion de ses données (opposition INSEE). Complétez nom et adresse manuellement.",
    };
  }

  const legalName = resolveLegalName(company);
  const address = formatEstablishmentAddress(establishment);

  if (!legalName || !address) {
    return {
      ok: false,
      code: "non_diffusible",
      message:
        "Les données publiques de cette entreprise sont incomplètes ou masquées. Complétez les champs manuellement.",
    };
  }

  return {
    ok: true,
    legalName,
    address,
    apeCode: resolveApeCode(company, establishment),
    suggestedLegalStatus: resolveSuggestedLegalStatus(company),
  };
}

export async function lookupCompanyBySiret(
  siretInput: string,
  fetchImpl: typeof fetch = fetch,
): Promise<CompanyLookupOutcome> {
  const siretParsed = siretDigitsSchema.safeParse(normalizeSiret(siretInput));
  if (!siretParsed.success) {
    return {
      ok: false,
      code: "invalid_siret",
      message: "Saisissez un numéro SIRET valide à 14 chiffres.",
    };
  }

  const siret = siretParsed.data;
  const url = new URL(COMPANY_LOOKUP_API_URL);
  url.searchParams.set("q", siret);
  url.searchParams.set("per_page", "10");

  try {
    const response = await fetchImpl(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(COMPANY_LOOKUP_TIMEOUT_MS),
      cache: "no-store",
    });

    if (response.status === 404) {
      return {
        ok: false,
        code: "not_found",
        message:
          "Aucune entreprise trouvée pour ce SIRET. Vérifiez le numéro ou complétez les champs manuellement.",
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        code: "api_unavailable",
        message:
          "L'annuaire des entreprises est temporairement indisponible. Réessayez dans quelques instants ou complétez manuellement.",
      };
    }

    const json: unknown = await response.json();
    return mapCompanyLookupResponse(json, siret);
  } catch {
    return {
      ok: false,
      code: "api_unavailable",
      message:
        "Impossible de joindre l'annuaire des entreprises (délai dépassé ou réseau). Réessayez ou complétez manuellement.",
    };
  }
}
