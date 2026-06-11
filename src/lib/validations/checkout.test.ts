import { describe, expect, it } from "vitest";

import {
  checkoutCustomerSchema,
  checkoutFormSchema,
  checkoutSessionSchema,
  relayPointSchema,
} from "@/lib/validations/checkout";

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

  it("rejette un panier vide", () => {
    const result = checkoutSessionSchema.safeParse({
      ...validPayload,
      items: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejette un identifiant de variante invalide", () => {
    const result = checkoutSessionSchema.safeParse({
      ...validPayload,
      items: [{ variantId: "pas-un-uuid", quantity: 1 }],
    });

    expect(result.success).toBe(false);
  });
});

const validCustomer = {
  firstName: "Marie",
  lastName: "Dupont",
  email: "marie@example.com",
  phone: "0612345678",
};

const validRelay = {
  id: "MR-123",
  name: "Relais Paris Centre",
  address: "1 rue Test",
  zip: "75001",
  city: "Paris",
  country: "FR",
};

describe("checkoutCustomerSchema", () => {
  it("valide des coordonnées complètes", () => {
    expect(checkoutCustomerSchema.safeParse(validCustomer).success).toBe(true);
  });

  it("rejette un e-mail invalide", () => {
    const result = checkoutCustomerSchema.safeParse({
      ...validCustomer,
      email: "pas-un-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejette un téléphone trop court", () => {
    const result = checkoutCustomerSchema.safeParse({
      ...validCustomer,
      phone: "123",
    });

    expect(result.success).toBe(false);
  });
});

describe("relayPointSchema", () => {
  it("valide un point relais Mondial Relay", () => {
    expect(relayPointSchema.safeParse(validRelay).success).toBe(true);
  });

  it("rejette un code postal trop court", () => {
    const result = relayPointSchema.safeParse({
      ...validRelay,
      zip: "75",
    });

    expect(result.success).toBe(false);
  });

  it("rejette un pays hors format ISO", () => {
    const result = relayPointSchema.safeParse({
      ...validRelay,
      country: "France",
    });

    expect(result.success).toBe(false);
  });

  it("rejette un point relais absent (identifiant vide)", () => {
    const result = relayPointSchema.safeParse({
      ...validRelay,
      id: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("id"))).toBe(true);
    }
  });

  it("accepte des horaires d'ouverture optionnels", () => {
    const result = relayPointSchema.safeParse({
      ...validRelay,
      openingHours: "Lun-Ven 9h-19h",
    });

    expect(result.success).toBe(true);
  });
});

describe("checkoutFormSchema", () => {
  it("valide le formulaire complet avec acceptation des CGV", () => {
    const result = checkoutFormSchema.safeParse({
      ...validCustomer,
      relayPoint: validRelay,
      acceptTerms: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejette si les CGV ne sont pas acceptées", () => {
    const result = checkoutFormSchema.safeParse({
      ...validCustomer,
      relayPoint: validRelay,
      acceptTerms: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("acceptTerms"))).toBe(true);
    }
  });
});
