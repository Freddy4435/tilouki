import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  isDevMockShippingEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/shipping/env", () => ({
  isDevMockShippingEnabled: mocks.isDevMockShippingEnabled,
}));

import { DevMockShippingProvider } from "@/lib/shipping/providers/dev-mock";

const labelInput = {
  orderId: "order-1",
  orderNumber: "TLK-2026-0042",
  sender: {
    name: "Tilouki SARL",
    street: "10 rue des Lilas",
    zip: "44000",
    city: "Nantes",
    country: "FR",
  },
  recipient: {
    name: "Jeanne Dupont",
    street: "2 RUE DE MULHOUSE",
    zip: "75002",
    city: "PARIS",
    country: "FR",
  },
  relayPointId: "012417",
  relayPointCountry: "FR",
  weightGrams: 800,
  deliveryMode: "24R" as const,
};

afterEach(() => {
  vi.clearAllMocks();
  mocks.isDevMockShippingEnabled.mockReturnValue(true);
});

describe("DevMockShippingProvider.createShipmentLabel", () => {
  it("retourne une étiquette factice clairement marquée DEV", async () => {
    const provider = new DevMockShippingProvider();

    const label = await provider.createShipmentLabel(labelInput);

    expect(label.isDevMock).toBe(true);
    expect(label.shipmentNumber).toMatch(/^DEV-\d{8}$/);
    expect(label.labelUrl).toContain("dev");
    expect(label.labelUrl).toContain(encodeURIComponent("TLK-2026-0042"));
  });

  it("échoue si le mock développement est désactivé", async () => {
    mocks.isDevMockShippingEnabled.mockReturnValue(false);
    const provider = new DevMockShippingProvider();

    await expect(provider.createShipmentLabel(labelInput)).rejects.toThrow(
      "Mock développement désactivé.",
    );
  });
});
