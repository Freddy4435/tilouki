import "server-only";

import { isDevMockShippingEnabled, isMondialRelayApiConfigured } from "@/lib/mondial-relay/env";
import { DevMockShippingProvider, UnconfiguredShippingProvider } from "@/lib/mondial-relay/providers/dev-mock";
import { MondialRelayApiProvider } from "@/lib/mondial-relay/providers/mondial-relay-api";
import type { ShippingProvider } from "@/lib/mondial-relay/types";

let provider: ShippingProvider | null = null;

/**
 * Factory provider livraison — API MR > mock dev > non configuré.
 * V2 : ajouter MondialRelayWidgetProvider si widget activé.
 */
export function getShippingProvider(): ShippingProvider {
  if (!provider) {
    if (isMondialRelayApiConfigured()) {
      provider = new MondialRelayApiProvider();
    } else if (isDevMockShippingEnabled()) {
      provider = new DevMockShippingProvider();
    } else {
      provider = new UnconfiguredShippingProvider();
    }
  }

  return provider;
}

/** Réinitialise le singleton (tests). */
export function resetShippingProvider(): void {
  provider = null;
}
