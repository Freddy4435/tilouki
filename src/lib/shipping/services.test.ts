import { describe, expect, it } from "vitest";

import {
  getShippingServiceForCarrier,
  getShippingServiceId,
  SHIPPING_SERVICES,
} from "@/lib/shipping/services";

describe("SHIPPING_SERVICES", () => {
  it("déclare un service point retrait par transporteur", () => {
    expect(SHIPPING_SERVICES.map((s) => s.carrier)).toEqual([
      "mondial_relay",
      "chronopost",
    ]);
    expect(SHIPPING_SERVICES.every((s) => s.id === "relay_point")).toBe(true);
  });

  it("retourne le service pour chaque transporteur", () => {
    expect(getShippingServiceForCarrier("mondial_relay").label).toBe("Mondial Relay");
    expect(getShippingServiceForCarrier("chronopost").methodLabel).toContain("Pickup");
    expect(getShippingServiceId("chronopost")).toBe("relay_point");
  });
});
