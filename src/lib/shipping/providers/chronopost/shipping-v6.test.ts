import { describe, expect, it } from "vitest";

import {
  buildShippingV6Envelope,
  parseShippingV6Response,
  pdfBase64ToDataUrl,
} from "@/lib/shipping/providers/chronopost/shipping-v6";
import { CHRONOPOST_SHIPPING_NAMESPACE } from "@/lib/shipping/providers/chronopost/soap";

const labelInput = {
  orderId: "11111111-2222-4333-8444-555555555555",
  orderNumber: "TLK-001",
  sender: {
    name: "Boutique Tilouki",
    street: "1 rue Test",
    zip: "75001",
    city: "Paris",
    country: "FR",
    phone: "0142000000",
    email: "boutique@tilouki.fr",
  },
  recipient: {
    name: "Marie Dupont",
    street: "2 rue Relais",
    zip: "69001",
    city: "Lyon",
    country: "FR",
    phone: "0612345678",
    email: "marie@example.fr",
  },
  relayPointId: "1699P",
  relayPointCountry: "FR",
  weightGrams: 500,
  accountNumber: "12345678",
  password: "secretpass",
};

describe("buildShippingV6Envelope", () => {
  it("inclut productCode 86 et recipientRef relais", () => {
    const xml = buildShippingV6Envelope(labelInput);

    expect(xml).toContain(`xmlns:cxf="${CHRONOPOST_SHIPPING_NAMESPACE}"`);
    expect(xml).toContain("<cxf:shippingV6>");
    expect(xml).toContain("<productCode>86</productCode>");
    expect(xml).toContain("<recipientRef>1699P</recipientRef>");
    expect(xml).toContain("<mode>PDF</mode>");
    expect(xml).toContain("<password>secretpass</password>");
    expect(xml).not.toContain("secretpass</accountNumber>");
  });
});

describe("parseShippingV6Response", () => {
  it("extrait numéro de suivi et PDF", () => {
    const xml = `<soapenv:Envelope>
      <soapenv:Body>
        <ns1:shippingV6Response>
          <return>
            <errorCode>0</errorCode>
            <skybillNumber>XY123456789FR</skybillNumber>
            <pdfEtiquette>JVBERi0x</pdfEtiquette>
          </return>
        </ns1:shippingV6Response>
      </soapenv:Body>
    </soapenv:Envelope>`;

    const result = parseShippingV6Response(xml);
    expect(result.errorCode).toBe("0");
    expect(result.skybillNumber).toBe("XY123456789FR");
    expect(result.pdfBase64).toBe("JVBERi0x");
  });

  it("remonte les erreurs applicatives", () => {
    const xml = `<return><errorCode>33</errorCode><errorMessage>Invalid password</errorMessage></return>`;
    const result = parseShippingV6Response(xml);
    expect(result.errorCode).toBe("33");
    expect(result.errorMessage).toBe("Invalid password");
  });
});

describe("pdfBase64ToDataUrl", () => {
  it("formate une data URL PDF", () => {
    expect(pdfBase64ToDataUrl("abc123")).toBe("data:application/pdf;base64,abc123");
  });
});
