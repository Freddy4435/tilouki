import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/security/log", () => ({
  logSecure: vi.fn(),
}));

import { logSecure } from "@/lib/security/log";
import { ShipmentLabelError } from "@/lib/shipping/errors";
import {
  ChronopostApiProvider,
  ChronopostServiceError,
} from "@/lib/shipping/providers/chronopost/api";
import {
  CHRONOPOST_RELAY_ENDPOINT,
  CHRONOPOST_RELAY_NAMESPACE,
  CHRONOPOST_SHIPPING_ENDPOINT,
  CHRONOPOST_SHIPPING_NAMESPACE,
} from "@/lib/shipping/providers/chronopost/soap";

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

const SAMPLE_OK_XML = `<return><errorCode>0</errorCode><listePointRelais>
  <identifiant>1699P</identifiant>
  <nom>Pickup Test</nom>
  <adresse1>1 rue Test</adresse1>
  <codePostal>75001</codePostal>
  <localite>PARIS</localite>
  <codePays>FR</codePays>
</listePointRelais></return>`;

function configureChronopost() {
  vi.stubEnv("CHRONOPOST_ACCOUNT_NUMBER", "12345678");
  vi.stubEnv("CHRONOPOST_PASSWORD", "secretpass");
}

beforeEach(() => {
  vi.stubEnv("CHRONOPOST_ACCOUNT_NUMBER", "");
  vi.stubEnv("CHRONOPOST_PASSWORD", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("ChronopostApiProvider.createShipmentLabel", () => {
  const SAMPLE_LABEL_OK_XML = `<return>
    <errorCode>0</errorCode>
    <skybillNumber>XY123456789FR</skybillNumber>
    <pdfEtiquette>JVBERi0x</pdfEtiquette>
  </return>`;

  it("refuse si Chronopost non configuré", async () => {
    const provider = new ChronopostApiProvider();

    await expect(provider.createShipmentLabel(labelInput)).rejects.toBeInstanceOf(
      ShipmentLabelError,
    );

    await expect(provider.createShipmentLabel(labelInput)).rejects.toMatchObject({
      category: "configuration",
    });
  });

  it("appelle shippingV6 et retourne numéro + PDF", async () => {
    configureChronopost();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => SAMPLE_LABEL_OK_XML,
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new ChronopostApiProvider();
    const label = await provider.createShipmentLabel(labelInput);

    expect(label.shipmentNumber).toBe("XY123456789FR");
    expect(label.labelUrl).toBe("data:application/pdf;base64,JVBERi0x");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(CHRONOPOST_SHIPPING_ENDPOINT);
    const body = String(init.body);
    expect(body).toContain(`xmlns:cxf="${CHRONOPOST_SHIPPING_NAMESPACE}"`);
    expect(body).toContain("<cxf:shippingV6>");
    expect(body).toContain("<recipientRef>1699P</recipientRef>");
    expect(body).toContain("<productCode>86</productCode>");
    expect(body).toContain("<password>secretpass</password>");
  });

  it("lève ShipmentLabelError sur errorCode Chronopost", async () => {
    configureChronopost();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          "<return><errorCode>33</errorCode><errorMessage>Invalid password</errorMessage></return>",
      }),
    );

    const provider = new ChronopostApiProvider();

    await expect(provider.createShipmentLabel(labelInput)).rejects.toMatchObject({
      category: "configuration",
    });
  });
});

describe("ChronopostApiProvider.searchRelayPoints — transport SOAP", () => {
  it("envoie un POST SOAP sans credentials dans l'URL", async () => {
    configureChronopost();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => SAMPLE_OK_XML,
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new ChronopostApiProvider();
    const result = await provider.searchRelayPoints({ zip: "75001", city: "Paris" });

    expect(result.points).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(CHRONOPOST_RELAY_ENDPOINT);
    expect(url).not.toMatch(/password|accountNumber/i);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: '""',
    });

    const body = String(init.body);
    expect(body).toContain(`xmlns:chr="${CHRONOPOST_RELAY_NAMESPACE}"`);
    expect(body).toContain("<chr:recherchePointChronopost>");
    expect(body).toContain("<password>secretpass</password>");
    expect(body).toContain("<accountNumber>12345678</accountNumber>");
    expect(body).toContain("<type>P</type>");
    expect(body).toContain("<service>L</service>");
  });

  it("ne logue jamais le mot de passe ni l'URL complète en cas d'erreur HTTP", async () => {
    configureChronopost();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "",
      }),
    );

    const provider = new ChronopostApiProvider();

    await expect(
      provider.searchRelayPoints({ zip: "75001", city: "Paris" }),
    ).rejects.toBeInstanceOf(ChronopostServiceError);

    const logCalls = vi.mocked(logSecure).mock.calls;
    for (const [, , meta] of logCalls) {
      const serialized = JSON.stringify(meta ?? {});
      expect(serialized).not.toContain("secretpass");
      expect(serialized).not.toContain("accountNumber=");
      expect(serialized).not.toContain(CHRONOPOST_RELAY_ENDPOINT);
    }
  });
});

describe("ChronopostApiProvider.findRelayPoint — transport SOAP", () => {
  it("consulte un point via rechercheDetailPointChronopost en POST", async () => {
    configureChronopost();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => SAMPLE_OK_XML,
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new ChronopostApiProvider();
    const result = await provider.findRelayPoint("1699P", "FR");

    expect(result.status).toBe("found");
    const body = String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body);
    expect(body).toContain("<chr:rechercheDetailPointChronopost>");
    expect(body).toContain("<identifiant>1699P</identifiant>");
    expect(body).toContain("<password>secretpass</password>");
  });
});
