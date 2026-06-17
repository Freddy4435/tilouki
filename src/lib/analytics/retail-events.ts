/**
 * Événements funnel e-commerce (Plausible custom goals).
 * Respecte le consentement analytics — no-op sans consentement ni script chargé.
 */

export type RetailAnalyticsEvent =
  | "add_to_cart"
  | "begin_checkout"
  | "view_item"
  | "add_capsule_to_cart";

export interface RetailEventProps {
  product_slug?: string;
  product_name?: string;
  value_cents?: number;
  item_count?: number;
  source?: string;
}

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number> },
    ) => void;
  }
}

function serializeProps(props: RetailEventProps): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    out[key] = value;
  }
  return out;
}

/** Envoie un goal Plausible si analytics autorisé et domaine configuré. */
export function trackRetailEvent(
  event: RetailAnalyticsEvent,
  props: RetailEventProps = {},
): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim()) return;

  const serialized = serializeProps(props);
  if (Object.keys(serialized).length > 0) {
    window.plausible?.(event, { props: serialized });
  } else {
    window.plausible?.(event);
  }
}
