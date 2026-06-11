import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ShipmentLabelError } from "@/lib/shipping/errors";
import { ChronopostApiProvider } from "@/lib/shipping/providers/chronopost/api";

const labelInput = {
  orderId: "11111111-2222-4333-8444-555555555555",
  orderNumber: "TLK-001",
  sender: {
    name: "Boutique",
    street: "1 rue Test",
    zip: "75001",
    city: "Paris",
    country: "FR",
  },
  recipient: {
    name: "Client",
    street: "2 rue Relais",
    zip: "69001",
    city: "Lyon",
    country: "FR",
  },
  relayPointId: "1699P",
  relayPointCountry: "FR",
  weightGrams: 500,
};

describe("ChronopostApiProvider.createShipmentLabel", () => {
  it("refuse avec un message clair (API non intégrée)", async () => {
    const provider = new ChronopostApiProvider();

    await expect(provider.createShipmentLabel(labelInput)).rejects.toBeInstanceOf(
      ShipmentLabelError,
    );

    await expect(provider.createShipmentLabel(labelInput)).rejects.toMatchObject({
      category: "configuration",
      message: expect.stringContaining("Chronopost"),
    });
  });
});
