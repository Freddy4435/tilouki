import { describe, expect, it } from "vitest";

import {
  redactEmail,
  redactSecrets,
  redactSensitiveData,
  serializeAppErrorMeta,
} from "@/lib/security/log";

describe("redactEmail", () => {
  it("masque les adresses e-mail", () => {
    expect(redactEmail("contact@tilouki.fr")).toBe("[email]");
    expect(redactEmail("Envoi à client@example.com")).toBe("Envoi à [email]");
  });
});

describe("redactSecrets", () => {
  it("masque clés API et téléphones dans les messages d'erreur", () => {
    const message = "Échec pour client@example.com avec sk_test_abc et 06 12 34 56 78";
    expect(redactSecrets(message)).toBe("Échec pour [email] avec [secret] et [phone]");
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

  it("masque le corps HTML et les erreurs fournisseur", () => {
    const result = redactSensitiveData({
      html: "<p>secret body</p>",
      error: "Resend rejected client@example.com",
    });

    expect(result?.html).toBe("[redacted]");
    expect(result?.error).toBe("Resend rejected [email]");
  });

  it("ne redige pas digest et name", () => {
    const result = redactSensitiveData({
      digest: "abc123digest",
      name: "TypeError",
      message: "client@example.com",
    });

    expect(result?.digest).toBe("abc123digest");
    expect(result?.name).toBe("TypeError");
    expect(result?.message).toBe("[email]");
  });
});

describe("serializeAppErrorMeta", () => {
  it("normalise digest et message vides", () => {
    const meta = serializeAppErrorMeta(new Error(""));
    expect(meta).toEqual({
      digest: "unknown",
      name: "Error",
      message: "(sans message)",
    });
  });
});
