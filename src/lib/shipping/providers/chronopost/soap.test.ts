import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildSoapEnvelope,
  sanitizeChronopostErrorMessage,
} from "@/lib/shipping/providers/chronopost/soap";

describe("buildSoapEnvelope", () => {
  it("place les credentials dans le corps SOAP, pas dans l'URL", () => {
    const envelope = buildSoapEnvelope(
      "http://cxf.rechercheBt.soap.chronopost.fr/",
      "recherchePointChronopost",
      {
        accountNumber: "12345678",
        password: "secretpass",
        zipCode: "75001",
      },
    );

    expect(envelope).toContain("<password>secretpass</password>");
    expect(envelope).toContain("<accountNumber>12345678</accountNumber>");
    expect(envelope).toContain("recherchePointChronopost");
    expect(envelope).not.toContain("?password=");
  });

  it("échappe les caractères XML spéciaux", () => {
    const envelope = buildSoapEnvelope(
      "http://cxf.quickcost.soap.chronopost.fr/",
      "quickCost",
      { city: "L'Haÿ & Co" },
    );

    expect(envelope).toContain("L&apos;Haÿ &amp; Co");
    expect(envelope).not.toContain("L'Haÿ");
  });
});

describe("sanitizeChronopostErrorMessage", () => {
  it("ne laisse ni accountNumber ni password en clair", () => {
    const sensitive = {
      accountNumber: "87654321",
      password: "mypassword",
    };
    const raw =
      "fetch failed accountNumber=87654321 password=mypassword https://ws.chronopost.fr/foo";

    const sanitized = sanitizeChronopostErrorMessage(raw, sensitive);

    expect(sanitized).not.toContain("mypassword");
    expect(sanitized).not.toContain("87654321");
    expect(sanitized).toContain("[redacted]");
  });
});
