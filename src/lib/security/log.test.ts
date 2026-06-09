import { describe, expect, it } from "vitest";

import { redactEmail, redactSensitiveData } from "@/lib/security/log";

describe("redactEmail", () => {
  it("masque les adresses e-mail", () => {
    expect(redactEmail("contact@tilouki.fr")).toBe("[email]");
    expect(redactEmail("Envoi à client@example.com")).toBe("Envoi à [email]");
  });
});

describe("redactSensitiveData", () => {
  it("masque les champs email et to", () => {
    const result = redactSensitiveData({
      to: "client@example.com",
      email: "admin@tilouki.fr",
      orderId: "abc",
    });

    expect(result?.to).toBe("[email]");
    expect(result?.email).toBe("[email]");
    expect(result?.orderId).toBe("abc");
  });
});
