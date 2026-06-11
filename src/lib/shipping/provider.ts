import "server-only";

import {
  isChronopostConfigured,
  isDevMockShippingEnabled,
  isMondialRelayApiConfigured,
} from "@/lib/shipping/env";
import { ChronopostApiProvider } from "@/lib/shipping/providers/chronopost";
import {
  DevMockShippingProvider,
  UnconfiguredShippingProvider,
} from "@/lib/shipping/providers/dev-mock";
import { MondialRelayApiProvider } from "@/lib/shipping/providers/mondial-relay/api";
import type { CarrierName, ShippingProvider } from "@/lib/shipping/types";

const providers = new Map<CarrierName, ShippingProvider>();

function createProvider(carrier: CarrierName): ShippingProvider {
  if (carrier === "chronopost") {
    if (isChronopostConfigured()) return new ChronopostApiProvider();
    if (isDevMockShippingEnabled()) return new DevMockShippingProvider("chronopost");
    return new UnconfiguredShippingProvider("chronopost");
  }

  if (isMondialRelayApiConfigured()) return new MondialRelayApiProvider();
  if (isDevMockShippingEnabled()) return new DevMockShippingProvider("mondial_relay");
  return new UnconfiguredShippingProvider("mondial_relay");
}

/**
 * Factory provider livraison par transporteur — API réelle > mock dev > non configuré.
 * Sans argument : Mondial Relay (comportement historique).
 */
export function getShippingProvider(
  carrier: CarrierName = "mondial_relay",
): ShippingProvider {
  let provider = providers.get(carrier);
  if (!provider) {
    provider = createProvider(carrier);
    providers.set(carrier, provider);
  }
  return provider;
}

/** Réinitialise les singletons (tests). */
export function resetShippingProvider(): void {
  providers.clear();
}
