import "server-only";

import { isDevMockShippingEnabled } from "@/lib/shipping/env";
import type {
  CarrierName,
  CreateShipmentLabelInput,
  RelayPoint,
  RelaySearchParams,
  RelaySearchResult,
  ShipmentLabel,
  ShippingProvider,
} from "@/lib/shipping/types";

/** Préfixes d'identifiants fictifs — bloqués en production (client-guards). */
const DEV_MOCK_ID_PREFIX: Record<CarrierName, string> = {
  mondial_relay: "DEV-MR-",
  chronopost: "DEV-CHR-",
};

const DEV_MOCK_POINT_NAMES: Record<CarrierName, string[]> = {
  mondial_relay: [
    "[DEV] Tabac Presse du Centre",
    "[DEV] Supérette Proximité",
    "[DEV] Locker Relais Express",
  ],
  chronopost: [
    "[DEV] Pickup Maison de la Presse",
    "[DEV] Pickup Pressing des Halles",
    "[DEV] Pickup Fleuriste Beauregard",
  ],
};

function buildDevMockPoints(
  carrier: CarrierName,
  params: RelaySearchParams,
): RelayPoint[] {
  const zip = params.zip.replace(/\s/g, "").slice(0, 5);
  const city = params.city?.trim() || "Ville exemple";
  const country = params.country ?? "FR";
  const prefix = DEV_MOCK_ID_PREFIX[carrier];
  const addresses = [
    "12 rue de la Paix",
    "45 avenue Jean Jaurès",
    "8 place de la Mairie",
  ];

  const hours = ["Lun-Ven 9h-19h", "Lun-Sam 8h30-20h", "7j/7 24h/24"];

  return DEV_MOCK_POINT_NAMES[carrier].map((name, index) => ({
    id: `${prefix}${zip}-0${index + 1}`,
    name,
    address: addresses[index] ?? "1 rue Exemple",
    zip,
    city,
    country,
    openingHours: hours[index],
    isDevMock: true,
  }));
}

export class DevMockShippingProvider implements ShippingProvider {
  readonly name = "dev_mock" as const;
  readonly carrier: CarrierName;

  constructor(carrier: CarrierName = "mondial_relay") {
    this.carrier = carrier;
  }

  async searchRelayPoints(params: RelaySearchParams): Promise<RelaySearchResult> {
    if (!isDevMockShippingEnabled()) {
      return {
        points: [],
        source: "dev_mock",
        configured: false,
        message: "Mock développement désactivé.",
      };
    }

    const points = buildDevMockPoints(this.carrier, params);

    return {
      points,
      source: "dev_mock",
      configured: true,
      message:
        "Points relais fictifs — environnement de développement uniquement. Ne pas utiliser en production.",
    };
  }

  /** Étiquette factice clairement marquée [DEV] — aucun appel réseau. */
  async createShipmentLabel(input: CreateShipmentLabelInput): Promise<ShipmentLabel> {
    if (!isDevMockShippingEnabled()) {
      throw new Error("Mock développement désactivé.");
    }

    const suffix = String(Date.now() % 100_000_000).padStart(8, "0");

    return {
      shipmentNumber: `DEV-${suffix}`,
      labelUrl: `https://example.com/dev/etiquette-mondial-relay-${encodeURIComponent(
        input.orderNumber,
      )}.pdf`,
      isDevMock: true,
    };
  }
}

const UNCONFIGURED_SOURCE: Record<CarrierName, RelaySearchResult["source"]> = {
  mondial_relay: "mondial_relay_api",
  chronopost: "chronopost_api",
};

export class UnconfiguredShippingProvider implements ShippingProvider {
  readonly name = "unconfigured" as const;
  readonly carrier: CarrierName;

  constructor(carrier: CarrierName = "mondial_relay") {
    this.carrier = carrier;
  }

  async searchRelayPoints(): Promise<RelaySearchResult> {
    const isProd = process.env.NODE_ENV === "production";
    const message =
      this.carrier === "chronopost"
        ? isProd
          ? "La livraison Chronopost relais n'est pas disponible. Configurez CHRONOPOST_ACCOUNT_NUMBER et CHRONOPOST_PASSWORD."
          : "Service Chronopost non configuré. Ajoutez les identifiants Chronopost ou utilisez le mock dev."
        : isProd
          ? "La livraison en point relais n'est pas disponible. Configurez MONDIAL_RELAY_BRAND_ID et MONDIAL_RELAY_PRIVATE_KEY."
          : "Service de points relais non configuré. Ajoutez les identifiants Mondial Relay ou utilisez le mock dev.";

    return {
      points: [],
      source: UNCONFIGURED_SOURCE[this.carrier],
      configured: false,
      message,
    };
  }
}
