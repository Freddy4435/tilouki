import { describe, expect, it } from "vitest";

import { mapCompanyLookupResponse } from "@/lib/admin/company-lookup";

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
});
