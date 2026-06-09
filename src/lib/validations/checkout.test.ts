import { describe, expect, it } from "vitest";

import { checkoutSessionSchema } from "@/lib/validations/checkout";

const validPayload = {
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

describe("checkoutSessionSchema", () => {
  it("valide un panier sans prix côté client", () => {
    const result = checkoutSessionSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejette les champs prix envoyés par le client", () => {
    const result = checkoutSessionSchema.safeParse({
      ...validPayload,
      totalCents: 100,
    });

    expect(result.success).toBe(false);
  });

  it("rejette une quantité excessive", () => {
    const result = checkoutSessionSchema.safeParse({
      ...validPayload,
      items: [{ variantId: "00000000-0000-0000-0000-000000000001", quantity: 99 }],
    });

    expect(result.success).toBe(false);
  });
});
