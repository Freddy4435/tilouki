import { describe, expect, it } from "vitest";

import {
  CHECKOUT_CLIENT_MESSAGES,
  mapCheckoutApiError,
  mapRelaySearchError,
} from "@/lib/checkout/client-messages";

describe("mapCheckoutApiError", () => {
  it("mappe le stock insuffisant", () => {
    expect(
      mapCheckoutApiError(400, "Stock insuffisant pour finaliser la commande."),
    ).toBe(CHECKOUT_CLIENT_MESSAGES.stockChanged);
  });

  it("mappe l'indisponibilité livraison", () => {
    expect(
      mapCheckoutApiError(
        503,
        "La livraison en point relais n'est pas disponible. Les identifiants Mondial Relay doivent être configurés.",
      ),
    ).toBe(CHECKOUT_CLIENT_MESSAGES.shippingUnavailable);
  });

  it("mappe le paiement non configuré", () => {
    expect(mapCheckoutApiError(503, "Le paiement n'est pas encore configuré.")).toBe(
      CHECKOUT_CLIENT_MESSAGES.paymentNotConfigured,
    );
  });
});

describe("mapRelaySearchError", () => {
  it("retourne un message si le service est indisponible", () => {
    expect(mapRelaySearchError({ configured: false, hasResults: false })).toBe(
      CHECKOUT_CLIENT_MESSAGES.relaySearchUnavailable,
    );
  });
});
