import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateShipmentLabelInput } from "@/lib/shipping/types";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/security/log", () => ({ logSecure: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

const labelInput: CreateShipmentLabelInput = {
  orderId: "order-1",
  orderNumber: "TLK-2026-0042",
  sender: {
    name: "Tilouki",
    street: "10 rue des Lilas",
    zip: "44000",
    city: "Nantes",
    country: "FR",
    phone: "0240000000",
    email: "contact@tilouki.fr",
  },
  recipient: {
    name: "Jeanne Dupont",
    street: "2 RUE DE MULHOUSE",
    zip: "75002",
    city: "PARIS",
    country: "FR",
    phone: "0612345678",
    email: "jeanne@example.com",
  },
  relayPointId: "12417",
  relayPointCountry: "FR",
  weightGrams: 800,
  deliveryMode: "24R",
};

function wsi2SoapResponse(inner: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI2_CreationEtiquetteResponse xmlns="http://www.mondialrelay.fr/webservice/">
      <WSI2_CreationEtiquetteResult>${inner}</WSI2_CreationEtiquetteResult>
    </WSI2_CreationEtiquetteResponse>
  </soap:Body>
</soap:Envelope>`;
}

beforeEach(() => {
  vi.stubEnv("MONDIAL_RELAY_BRAND_ID", "BDTEST13");
  vi.stubEnv("MONDIAL_RELAY_PRIVATE_KEY", "private-key-test");
  globalThis.fetch = fetchMock as typeof fetch;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("MondialRelayApiProvider.createShipmentLabel", () => {
  it("retourne numéro d'expédition et URL absolue sur STAT=0", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        wsi2SoapResponse(`
          <STAT>0</STAT>
          <ExpeditionNum>12345678</ExpeditionNum>
          <URL_Etiquette>/ww2/PDF/StickerMaker2.aspx?expedition=12345678</URL_Etiquette>
        `),
    } as Response);

    const { MondialRelayApiProvider } =
      await import("@/lib/shipping/providers/mondial-relay/api");
    const provider = new MondialRelayApiProvider();

    const label = await provider.createShipmentLabel(labelInput);

    expect(label.shipmentNumber).toBe("12345678");
    expect(label.labelUrl).toBe(
      "https://www.mondialrelay.com/ww2/PDF/StickerMaker2.aspx?expedition=12345678",
    );
    expect(fetchMock).toHaveBeenCalled();
  });

  it("lève ShipmentLabelError sur STAT de validation sans modifier la commande", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => wsi2SoapResponse("<STAT>20</STAT>"),
    } as Response);

    const { MondialRelayApiProvider } =
      await import("@/lib/shipping/providers/mondial-relay/api");
    const { ShipmentLabelError } = await import("@/lib/shipping/errors");
    const provider = new MondialRelayApiProvider();

    await expect(provider.createShipmentLabel(labelInput)).rejects.toBeInstanceOf(
      ShipmentLabelError,
    );
    await expect(provider.createShipmentLabel(labelInput)).rejects.toMatchObject({
      category: "validation",
    });
  });

  it("refuse si l'API n'est pas configurée", async () => {
    vi.unstubAllEnvs();
    const { MondialRelayApiProvider } =
      await import("@/lib/shipping/providers/mondial-relay/api");
    const { ShipmentLabelError } = await import("@/lib/shipping/errors");
    const provider = new MondialRelayApiProvider();

    await expect(provider.createShipmentLabel(labelInput)).rejects.toBeInstanceOf(
      ShipmentLabelError,
    );
    await expect(provider.createShipmentLabel(labelInput)).rejects.toMatchObject({
      category: "configuration",
    });
  });
});
