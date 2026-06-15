import { describe, expect, it } from "vitest";

import { getLegalComplianceSummary } from "@/lib/legal/compliance";
import {
  matchesVerifiedSellerIdentity,
  VERIFIED_SELLER_IDENTITY,
  withVerifiedSellerIdentityDefaults,
} from "@/lib/legal/verified-seller-identity";

describe("verified-seller-identity", () => {
  it("préremplit uniquement les champs vides", () => {
    const { values, suggestedFields } = withVerifiedSellerIdentityDefaults({
      legalName: null,
      legalStatus: "",
      siret: "10462384800017",
      address: null,
    });

    expect(values.legalName).toBe(VERIFIED_SELLER_IDENTITY.legalName);
    expect(values.legalStatus).toBe(VERIFIED_SELLER_IDENTITY.legalStatus);
    expect(values.siret).toBe("10462384800017");
    expect(values.address).toBe(VERIFIED_SELLER_IDENTITY.address);
    expect(suggestedFields).toEqual(["legalName", "legalStatus", "address"]);
  });

  it("ne remplace pas une valeur déjà renseignée", () => {
    const { values, suggestedFields } = withVerifiedSellerIdentityDefaults({
      legalName: "Autre Nom",
      legalStatus: "SASU",
      siret: "99999999999999",
      address: "12 rue Example",
    });

    expect(values.legalName).toBe("Autre Nom");
    expect(suggestedFields).toEqual([]);
  });

  it("reconnaît l'identité vérifiée complète", () => {
    expect(
      matchesVerifiedSellerIdentity({
        legalName: VERIFIED_SELLER_IDENTITY.legalName,
        legalStatus: VERIFIED_SELLER_IDENTITY.legalStatus,
        siret: VERIFIED_SELLER_IDENTITY.siret,
        address: VERIFIED_SELLER_IDENTITY.address,
      }),
    ).toBe(true);
  });

  it("laisse les champs obligatoires manquants visibles pour le checkout", () => {
    const summary = getLegalComplianceSummary({
      shopName: "Tilouki",
      legalName: VERIFIED_SELLER_IDENTITY.legalName,
      legalStatus: VERIFIED_SELLER_IDENTITY.legalStatus,
      siret: VERIFIED_SELLER_IDENTITY.siret,
      address: VERIFIED_SELLER_IDENTITY.address,
      email: null,
      phone: null,
      hostName: "Vercel Inc.",
      hostAddress: "440 N Barranca Ave",
      hostEmail: "support@vercel.com",
      mediationName: null,
      mediationUrl: null,
      returnPolicy: "Retours sous 14 jours.",
    });

    expect(summary.isComplete).toBe(false);
    expect(summary.missingRequired.map((item) => item.id)).toEqual(
      expect.arrayContaining(["email", "phone", "mediationName", "mediationUrl"]),
    );
    expect(summary.missingRequired.some((item) => item.id === "legalName")).toBe(false);
    expect(summary.missingRequired.some((item) => item.id === "siret")).toBe(false);
  });
});
