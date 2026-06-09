import "server-only";

import { getShippingProvider } from "@/lib/mondial-relay/provider";
import type { RelayPointInput } from "@/types/catalog";

/**
 * Vérifie que le point relais existe côté transporteur (anti-fraude checkout).
 */
export async function validateRelayPoint(relay: RelayPointInput): Promise<boolean> {
  const provider = getShippingProvider();
  const result = await provider.searchRelayPoints({
    zip: relay.zip,
    country: relay.country,
    city: relay.city,
  });

  if (result.source === "dev_mock") {
    return Boolean(relay.id && relay.zip && relay.country);
  }

  if (!result.configured || result.points.length === 0) {
    return false;
  }

  return result.points.some(
    (point) =>
      point.id === relay.id &&
      point.zip === relay.zip &&
      point.country.toUpperCase() === relay.country.toUpperCase(),
  );
}
