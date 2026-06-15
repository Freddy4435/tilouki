import { afterEach, describe, expect, it, vi } from "vitest";

import { StripeCheckoutError } from "@/lib/stripe/errors";

const mocks = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
  guardApiRequest: vi.fn<() => Promise<null | Response>>(async () => null),
}));

vi.mock("@/lib/stripe", async () => {
  const { StripeCheckoutError: ErrorClass } = await import("@/lib/stripe/errors");
  return {
    createCheckoutSession: mocks.createCheckoutSession,
    StripeCheckoutError: ErrorClass,
  };
});

vi.mock("@/lib/security/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/security/api")>();
  return {
    ...actual,
    guardApiRequest: mocks.guardApiRequest,
  };
});

vi.mock("@/lib/security/log", () => ({
  logSecure: vi.fn(),
}));

import { POST } from "@/app/api/checkout/create-session/route";

const validBody = {
  customer: {
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie@example.com",
    phone: "0612345678",
  },
  relayPoint: {
    id: "MR-123",
    name: "Relais",
    address: "1 rue Test",
    zip: "75001",
    city: "Paris",
    country: "FR",
  },
  items: [{ variantId: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 }],
};

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/checkout/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
  mocks.guardApiRequest.mockResolvedValue(null);
});

describe("POST /api/checkout/create-session", () => {
  it("retourne 400 pour un corps JSON invalide", async () => {
    const request = new Request("http://localhost/api/checkout/create-session", {
      method: "POST",
      body: "pas du json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Corps JSON invalide." });
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("retourne 400 pour des données de checkout invalides", async () => {
    const response = await POST(
      jsonRequest({
        ...validBody,
        customer: { ...validBody.customer, email: "invalide" },
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("retourne la session Stripe en cas de succès", async () => {
    mocks.createCheckoutSession.mockResolvedValue({
      sessionId: "cs_test_123",
      url: "https://checkout.stripe.com/test",
      orderId: "order-1",
      orderNumber: "TK-2025-0001",
    });

    const response = await POST(jsonRequest(validBody));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      sessionId: "cs_test_123",
      url: "https://checkout.stripe.com/test",
    });
    expect(mocks.createCheckoutSession).toHaveBeenCalledOnce();
  });

  it("retourne le message démo quand le checkout est bloqué en production", async () => {
    mocks.createCheckoutSession.mockRejectedValue(
      new StripeCheckoutError(
        "Ce panier contient des articles de démonstration qui ne peuvent pas être vendus en production. Retirez-les de votre panier ou contactez la boutique.",
        400,
        true,
      ),
    );

    const response = await POST(jsonRequest(validBody));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error:
        "Ce panier contient des articles de démonstration qui ne peuvent pas être vendus en production. Retirez-les de votre panier ou contactez la boutique.",
    });
  });

  it("retourne 400 quand le stock ou le relais est refusé", async () => {
    mocks.createCheckoutSession.mockRejectedValue(
      new StripeCheckoutError("Stock insuffisant pour finaliser la commande."),
    );

    const response = await POST(jsonRequest(validBody));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error:
        "Impossible de finaliser la commande. Vérifiez votre panier et le point relais.",
    });
  });

  it("retourne 503 quand le paiement est indisponible", async () => {
    mocks.createCheckoutSession.mockRejectedValue(
      new StripeCheckoutError("Livraison non configurée.", 503),
    );

    const response = await POST(jsonRequest(validBody));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Le paiement est temporairement indisponible.",
    });
  });

  it("retourne 429 quand le rate limit bloque la requête", async () => {
    const { NextResponse } = await import("next/server");
    mocks.guardApiRequest.mockResolvedValue(
      NextResponse.json({ error: "Trop de requêtes." }, { status: 429 }),
    );

    const response = await POST(jsonRequest(validBody));

    expect(response.status).toBe(429);
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });
});
