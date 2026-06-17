import { describe, expect, it, vi } from "vitest";

import {
  lookupCompanyBySiret,
  mapCompanyLookupResponse,
} from "@/lib/admin/company-lookup";
import { VERIFIED_SELLER_IDENTITY } from "@/lib/legal/verified-seller-identity";

const nominalPayload = {
  results: [
    {
      siren: "123456789",
      nom_complet: "Marie Martin",
      nom_raison_sociale: "MARIE MARTIN",
      nature_juridique: "1000",
      statut_diffusion: "O",
      complements: { est_entrepreneur_individuel: true },
      activite_principale: "47.71Z",
      siege: {
        siret: "12345678901234",
        geo_adresse: "12 rue des Lilas, 31000 Toulouse",
        activite_principale: "47.71Z",
        statut_diffusion_etablissement: "O",
      },
    },
  ],
  total_results: 1,
};

describe("mapCompanyLookupResponse", () => {
  it("mappe une réponse nominale", () => {
    const outcome = mapCompanyLookupResponse(nominalPayload, "12345678901234");
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(outcome.legalName).toBe("Marie Martin");
    expect(outcome.address).toBe("12 rue des Lilas, 31000 Toulouse");
    expect(outcome.apeCode).toBe("47.71Z");
    expect(outcome.suggestedLegalStatus).toBe("Auto-entrepreneur");
  });

  it("signale un SIRET introuvable", () => {
    const outcome = mapCompanyLookupResponse(
      { results: [], total_results: 0 },
      "99999999999999",
    );
    expect(outcome).toEqual({
      ok: false,
      code: "not_found",
      message:
        "Aucune entreprise trouvée pour ce SIRET. Vérifiez le numéro ou complétez les champs manuellement.",
    });
  });

  it("refuse une entreprise non diffusible ou masquée", () => {
    const outcome = mapCompanyLookupResponse(
      {
        results: [
          {
            statut_diffusion: "P",
            siege: {
              siret: "12345678901234",
              statut_diffusion_etablissement: "P",
            },
          },
        ],
      },
      "12345678901234",
    );

    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe("non_diffusible");
  });

  it("rejette un SIRET invalide", () => {
    const outcome = mapCompanyLookupResponse(nominalPayload, "123");
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe("invalid_siret");
  });

  it("mappe le SIRET vendeur vérifié (fixture API gouv, sans appel réseau)", () => {
    const ownerPayload = {
      results: [
        {
          siren: VERIFIED_SELLER_IDENTITY.siren,
          nom_complet: VERIFIED_SELLER_IDENTITY.publicName,
          nature_juridique: "1000",
          statut_diffusion: "O",
          complements: { est_entrepreneur_individuel: true },
          activite_principale: VERIFIED_SELLER_IDENTITY.activityCode,
          siege: {
            siret: VERIFIED_SELLER_IDENTITY.siret,
            adresse: "1 IMPASSE DES PERRIERES 44117 SAINT-ANDRE-DES-EAUX",
            code_postal: "44117",
            libelle_commune: "SAINT-ANDRE-DES-EAUX",
            activite_principale: VERIFIED_SELLER_IDENTITY.activityCode,
            statut_diffusion_etablissement: "O",
          },
        },
      ],
      total_results: 1,
    };

    const outcome = mapCompanyLookupResponse(
      ownerPayload,
      VERIFIED_SELLER_IDENTITY.siret,
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(outcome.legalName).toBe(VERIFIED_SELLER_IDENTITY.publicName);
    expect(outcome.address).toContain("SAINT-ANDRE-DES-EAUX");
    expect(outcome.address).toContain("44117");
    expect(outcome.apeCode).toBe(VERIFIED_SELLER_IDENTITY.activityCode);
    expect(outcome.suggestedLegalStatus).toBe("Auto-entrepreneur");
  });

  it("ne fabrique aucune donnée si la réponse API est illisible", () => {
    const outcome = mapCompanyLookupResponse({ broken: true }, "12345678901234");
    expect(outcome).toEqual({
      ok: false,
      code: "api_unavailable",
      message:
        "L'annuaire des entreprises est temporairement indisponible. Réessayez dans quelques instants ou complétez manuellement.",
    });
  });
});

describe("lookupCompanyBySiret", () => {
  it("ne renvoie pas de données inventées quand l'API échoue", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    const outcome = await lookupCompanyBySiret("10462384800017", fetchMock);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe("api_unavailable");
    expect(outcome).not.toHaveProperty("legalName");
    expect(outcome).not.toHaveProperty("address");
  });
});
