import "server-only";

import { isDevMockShippingEnabled } from "@/lib/mondial-relay/env";
import type {
  RelayPoint,
  RelaySearchParams,
  RelaySearchResult,
  ShippingProvider,
} from "@/lib/mondial-relay/types";

function buildDevMockPoints(params: RelaySearchParams): RelayPoint[] {
  const zip = params.zip.replace(/\s/g, "").slice(0, 5);
  const city = params.city?.trim() || "Ville exemple";
  const country = params.country ?? "FR";

  return [
    {
      id: `DEV-MR-${zip}-01`,
      name: "[DEV] Tabac Presse du Centre",
      address: "12 rue de la Paix",
      zip,
      city,
      country,
      isDevMock: true,
    },
    {
      id: `DEV-MR-${zip}-02`,
      name: "[DEV] Supérette Proximité",
      address: "45 avenue Jean Jaurès",
      zip,
      city,
      country,
      isDevMock: true,
    },
    {
      id: `DEV-MR-${zip}-03`,
      name: "[DEV] Locker Relais Express",
      address: "8 place de la Mairie",
      zip,
      city,
      country,
      isDevMock: true,
    },
  ];
}

export class DevMockShippingProvider implements ShippingProvider {
  readonly name = "dev_mock" as const;

  async searchRelayPoints(params: RelaySearchParams): Promise<RelaySearchResult> {
    if (!isDevMockShippingEnabled()) {
      return {
        points: [],
        source: "dev_mock",
        configured: false,
        message: "Mock développement désactivé.",
      };
    }

    const points = buildDevMockPoints(params);

    return {
      points,
      source: "dev_mock",
      configured: true,
      message:
        "Points relais fictifs — environnement de développement uniquement. Ne pas utiliser en production.",
    };
  }
}

export class UnconfiguredShippingProvider implements ShippingProvider {
  readonly name = "unconfigured" as const;

  async searchRelayPoints(): Promise<RelaySearchResult> {
    return {
      points: [],
      source: "mondial_relay_api",
      configured: false,
      message:
        "Service de points relais non configuré. Ajoutez les identifiants Mondial Relay ou activez le mock dev.",
    };
  }
}
