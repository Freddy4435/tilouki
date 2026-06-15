import { describe, expect, it } from "vitest";

import { formatRelayDistance } from "@/lib/shipping/labels";

describe("formatRelayDistance", () => {
  it("affiche les mètres sous 1 km", () => {
    expect(formatRelayDistance(350)).toBe("à 350 m");
  });

  it("affiche les kilomètres au-delà de 1 km", () => {
    expect(formatRelayDistance(1250)).toBe("à 1,3 km");
  });

  it("arrondit les longues distances", () => {
    expect(formatRelayDistance(12_500)).toBe("à 13 km");
  });
});
