import { describe, expect, it } from "vitest";

import {
  TRACKING_TOKEN_EMPTY_MESSAGE,
  TRACKING_TOKEN_INVALID_MESSAGE,
  resolveInitialTrackingToken,
  validateTrackingTokenLookup,
} from "@/lib/validations/tracking";

describe("validateTrackingTokenLookup", () => {
  it("accepte un UUID valide", () => {
    const token = "550e8400-e29b-41d4-a716-446655440000";
    expect(validateTrackingTokenLookup(token)).toEqual({ ok: true, token });
  });

  it("trim les espaces autour du token", () => {
    const token = "550e8400-e29b-41d4-a716-446655440000";
    expect(validateTrackingTokenLookup(`  ${token}  `)).toEqual({
      ok: true,
      token,
    });
  });

  it("rejette une chaîne vide", () => {
    expect(validateTrackingTokenLookup("")).toEqual({
      ok: false,
      error: TRACKING_TOKEN_EMPTY_MESSAGE,
    });
    expect(validateTrackingTokenLookup("   ")).toEqual({
      ok: false,
      error: TRACKING_TOKEN_EMPTY_MESSAGE,
    });
  });

  it("rejette un token non UUID", () => {
    expect(validateTrackingTokenLookup("pas-un-uuid")).toEqual({
      ok: false,
      error: TRACKING_TOKEN_INVALID_MESSAGE,
    });
  });
});

describe("resolveInitialTrackingToken", () => {
  it("privilégie le token serveur quand les deux sont présents", () => {
    expect(
      resolveInitialTrackingToken("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", "from-url"),
    ).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
  });

  it("utilise le paramètre URL en secours", () => {
    expect(resolveInitialTrackingToken(undefined, "from-url")).toBe("from-url");
  });

  it("utilise l'URL navigateur en dernier recours", () => {
    expect(resolveInitialTrackingToken(undefined, null, "from-browser")).toBe(
      "from-browser",
    );
  });

  it("retourne une chaîne vide sans token", () => {
    expect(resolveInitialTrackingToken(undefined, null)).toBe("");
  });
});
