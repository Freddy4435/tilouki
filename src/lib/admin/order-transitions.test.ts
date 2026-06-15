import { describe, expect, it } from "vitest";

import {
  canCancelOrder,
  canTransitionTo,
  getNextFulfillmentStatus,
  isTerminalStatus,
  requiresTrackingForShip,
} from "@/lib/admin/order-transitions";

describe("getNextFulfillmentStatus", () => {
  it("suit le flux paid → preparing → shipped → delivered", () => {
    expect(getNextFulfillmentStatus("paid")).toBe("preparing");
    expect(getNextFulfillmentStatus("preparing")).toBe("shipped");
    expect(getNextFulfillmentStatus("shipped")).toBe("delivered");
  });

  it("retourne null hors du flux de préparation", () => {
    expect(getNextFulfillmentStatus("pending")).toBeNull();
    expect(getNextFulfillmentStatus("delivered")).toBeNull();
    expect(getNextFulfillmentStatus("cancelled")).toBeNull();
  });
});

describe("canTransitionTo — commande payée", () => {
  it("autorise uniquement l'étape suivante du flux", () => {
    expect(
      canTransitionTo({ status: "paid", paymentStatus: "paid" }, "preparing").allowed,
    ).toBe(true);
    expect(
      canTransitionTo({ status: "preparing", paymentStatus: "paid" }, "shipped")
        .allowed,
    ).toBe(true);
    expect(
      canTransitionTo({ status: "shipped", paymentStatus: "paid" }, "delivered")
        .allowed,
    ).toBe(true);
  });

  it("refuse de sauter une étape (paid → shipped)", () => {
    const result = canTransitionTo(
      { status: "paid", paymentStatus: "paid" },
      "shipped",
    );
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("Transition invalide");
  });

  it("refuse un retour en arrière (shipped → preparing)", () => {
    expect(
      canTransitionTo({ status: "shipped", paymentStatus: "paid" }, "preparing")
        .allowed,
    ).toBe(false);
  });

  it("refuse l'annulation d'une commande payée", () => {
    expect(
      canTransitionTo({ status: "paid", paymentStatus: "paid" }, "cancelled").allowed,
    ).toBe(false);
  });
});

describe("canTransitionTo — commande non payée", () => {
  it("autorise uniquement l'annulation d'une commande pending", () => {
    expect(
      canTransitionTo({ status: "pending", paymentStatus: "pending" }, "cancelled")
        .allowed,
    ).toBe(true);
    expect(
      canTransitionTo({ status: "pending", paymentStatus: "pending" }, "shipped")
        .allowed,
    ).toBe(false);
  });
});

describe("helpers", () => {
  it("canCancelOrder : pending non payée uniquement", () => {
    expect(canCancelOrder({ status: "pending", paymentStatus: "pending" })).toBe(true);
    expect(canCancelOrder({ status: "paid", paymentStatus: "paid" })).toBe(false);
  });

  it("requiresTrackingForShip : uniquement pour shipped", () => {
    expect(requiresTrackingForShip("shipped")).toBe(true);
    expect(requiresTrackingForShip("preparing")).toBe(false);
  });

  it("isTerminalStatus : delivered / cancelled / refunded", () => {
    expect(isTerminalStatus("delivered")).toBe(true);
    expect(isTerminalStatus("cancelled")).toBe(true);
    expect(isTerminalStatus("refunded")).toBe(true);
    expect(isTerminalStatus("shipped")).toBe(false);
  });
});
