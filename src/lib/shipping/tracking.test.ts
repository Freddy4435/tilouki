import { describe, expect, it } from "vitest";

import { buildMondialRelayTrackingUrl } from "@/lib/shipping/tracking";

describe("buildMondialRelayTrackingUrl", () => {
  it("construit le lien public avec numéro et code postal", () => {
    expect(buildMondialRelayTrackingUrl("12345678", "75002")).toBe(
      "https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=12345678&codePostal=75002",
    );
  });

  it("omet le code postal s'il est invalide ou absent", () => {
    expect(buildMondialRelayTrackingUrl("12345678", null)).toBe(
      "https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=12345678",
    );
    expect(buildMondialRelayTrackingUrl("12345678", "ABC")).toBe(
      "https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=12345678",
    );
  });

  it("retourne null pour les numéros non Mondial Relay", () => {
    expect(buildMondialRelayTrackingUrl(null, "75002")).toBeNull();
    expect(buildMondialRelayTrackingUrl("", "75002")).toBeNull();
    expect(buildMondialRelayTrackingUrl("DEV-12345678", "75002")).toBeNull();
    expect(buildMondialRelayTrackingUrl("3S-TRACK-001", "75002")).toBeNull();
    expect(buildMondialRelayTrackingUrl("1234", "75002")).toBeNull();
  });
});
