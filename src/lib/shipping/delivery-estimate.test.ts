import { describe, expect, it } from "vitest";

import {
  addBusinessDays,
  estimateDeliveryArrival,
  parseTransitBusinessDays,
} from "@/lib/shipping/delivery-estimate";

describe("delivery-estimate", () => {
  it("parse les délais transporteur", () => {
    expect(parseTransitBusinessDays("3 à 5 jours ouvrés")).toEqual({
      minDays: 3,
      maxDays: 5,
    });
  });

  it("ajoute des jours ouvrés en ignorant le week-end", () => {
    // Vendredi 2026-06-19 + 1 jour ouvré = lundi 2026-06-22
    const friday = new Date("2026-06-19T12:00:00");
    const result = addBusinessDays(friday, 1);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(22);
  });

  it("produit un libellé d'arrivée en français", () => {
    const estimate = estimateDeliveryArrival(
      "mondial_relay",
      new Date("2026-06-17T10:00:00"),
    );
    expect(estimate.arrivalLabel).toMatch(/entre le|vers le/);
    expect(estimate.transitLabel).toContain("jours");
  });
});
