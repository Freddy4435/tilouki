import { describe, expect, it, vi, afterEach } from "vitest";

import { buildCsp, generateCspNonce } from "@/lib/security/headers";

describe("buildCsp", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("inclut le nonce et strict-dynamic pour les scripts", () => {
    const nonce = "test-nonce-base64";
    const csp = buildCsp(nonce);

    expect(csp).toContain(`'nonce-${nonce}'`);
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("https://js.stripe.com");
    expect(csp).toContain("https://widget.mondialrelay.com");
  });

  it("n'inclut pas unsafe-eval en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(buildCsp("n")).not.toContain("'unsafe-eval'");
  });
});

describe("generateCspNonce", () => {
  it("génère une valeur non vide", () => {
    expect(generateCspNonce().length).toBeGreaterThan(8);
  });
});
