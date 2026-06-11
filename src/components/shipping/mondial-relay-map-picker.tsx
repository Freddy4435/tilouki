"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";

import type { MondialRelayWidgetConfig, RelayPoint } from "@/lib/shipping/types";

/**
 * Widget officiel Mondial Relay "Parcel Shop Picker" v4 (carte Leaflet).
 *
 * Doc : https://widget.mondialrelay.com — plugin jQuery "MR_ParcelShopPicker".
 * Le loader (jquery.plugin.mondialrelay.parcelshoppicker.min.js) charge ensuite
 * lui-même le bundle versionné (/parcelshop-picker/js?v=…), les thèmes CSS et
 * Leaflet (https://unpkg.com/leaflet/...) + tuiles OpenStreetMap.
 *
 * Les scripts ne sont montés (next/script lazyOnload) que lorsque ce composant
 * est rendu, c'est-à-dire à l'étape livraison du checkout — jamais ailleurs.
 */

const JQUERY_SRC = "https://code.jquery.com/jquery-3.7.1.min.js";
const MR_WIDGET_SRC =
  "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js";

/** Enseigne de test officielle Mondial Relay (documentation widget / WSI4). */
const MR_TEST_BRAND_ID = "BDTEST13";

const WIDGET_ZONE_ID = "mr-map-picker-zone";
const WIDGET_TARGET_ID = "mr-map-picker-target";

/** Si le widget n'a rien rendu passé ce délai, le chargement est considéré en échec. */
const WIDGET_RENDER_TIMEOUT_MS = 10_000;

/** Payload du callback OnParcelShopSelected (doc widget v4). */
interface MondialRelaySelectionData {
  ID?: string;
  Nom?: string;
  Adresse1?: string;
  Adresse2?: string;
  CP?: string;
  Ville?: string;
  Pays?: string;
}

interface MondialRelayPickerOptions {
  Target: string;
  Brand: string;
  Country: string;
  PostCode?: string;
  /** Mode de livraison : 24R (standard), 24L (XL), DRI (drive). */
  ColLivMod?: string;
  /** Poids du colis en grammes — filtre les points incompatibles. */
  Weight?: string;
  NbResults?: string;
  Responsive?: boolean;
  ShowResultsOnMap?: boolean;
  DisplayMapInfo?: boolean;
  WidgetLanguage?: string;
  OnParcelShopSelected?: (data: MondialRelaySelectionData) => void;
}

interface MondialRelayJQueryWrapped {
  MR_ParcelShopPicker(options: MondialRelayPickerOptions): void;
}

type MondialRelayJQuery = ((
  element: HTMLElement | string,
) => MondialRelayJQueryWrapped) & {
  fn?: { MR_ParcelShopPicker?: unknown };
};

declare global {
  interface Window {
    jQuery?: MondialRelayJQuery;
  }
}

export type MapPickerFallbackReason = "load_error" | "unconfigured";

interface MondialRelayMapPickerProps {
  /** Code postal pré-rempli (champ de recherche existant). */
  zip: string;
  /** Poids total du colis en grammes. */
  weightGrams: number;
  /**
   * Nonce CSP de la requête. Avec 'strict-dynamic', la confiance des deux
   * <Script> noncés (jQuery + loader MR) se propage au bundle versionné,
   * aux thèmes et à Leaflet que le loader charge lui-même.
   */
  nonce?: string;
  /** Reçoit le point relais sélectionné sur la carte. */
  onSelect: (point: RelayPoint) => void;
  /** Appelé si le widget ne peut pas être affiché (échec script ou non configuré). */
  onFallback: (reason: MapPickerFallbackReason) => void;
}

function mapSelectionToRelayPoint(data: MondialRelaySelectionData): RelayPoint | null {
  const id = data.ID?.trim();
  const zip = data.CP?.trim();
  const city = data.Ville?.trim();
  if (!id || !zip || !city) return null;

  const country = data.Pays?.trim().toUpperCase();
  const address = [data.Adresse1?.trim(), data.Adresse2?.trim()]
    .filter(Boolean)
    .join(", ");

  return {
    id,
    name: data.Nom?.trim() || `Point relais ${id}`,
    address: address || city,
    zip,
    city,
    country: country && country.length === 2 ? country : "FR",
  };
}

export function MondialRelayMapPicker({
  zip,
  weightGrams,
  nonce,
  onSelect,
  onFallback,
}: MondialRelayMapPickerProps) {
  const [config, setConfig] = useState<MondialRelayWidgetConfig | null>(null);
  // Si l'utilisateur revient à l'étape livraison, les scripts sont déjà
  // présents : on détecte les globaux pour ne pas attendre onLoad.
  const [jqueryReady, setJqueryReady] = useState(
    () => typeof window !== "undefined" && typeof window.jQuery === "function",
  );
  const [widgetScriptReady, setWidgetScriptReady] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.jQuery?.fn?.MR_ParcelShopPicker === "function",
  );
  const [widgetRendered, setWidgetRendered] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Refs pour que l'initialisation (unique) du widget lise les valeurs
  // courantes sans ré-exécuter l'effet quand zip/poids changent.
  const onSelectRef = useRef(onSelect);
  const onFallbackRef = useRef(onFallback);
  const zipRef = useRef(zip);
  const weightRef = useRef(weightGrams);
  const configRef = useRef(config);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onFallbackRef.current = onFallback;
    zipRef.current = zip;
    weightRef.current = weightGrams;
    configRef.current = config;
  });

  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/shipping/widget-config");
        if (!response.ok) throw new Error("widget-config indisponible");
        const data = (await response.json()) as MondialRelayWidgetConfig;
        if (!cancelled) setConfig(data);
      } catch {
        if (!cancelled) onFallbackRef.current("load_error");
      }
    }

    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  // Enseigne : NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID (résolue par /api/shipping/widget-config),
  // sinon enseigne de test officielle BDTEST13 en développement uniquement.
  const brandId = config
    ? (config.brandId ?? (isProduction ? null : MR_TEST_BRAND_ID))
    : null;

  useEffect(() => {
    if (config && isProduction && !config.brandId) {
      onFallbackRef.current("unconfigured");
    }
  }, [config, isProduction]);

  const handleScriptError = useCallback(() => {
    onFallbackRef.current("load_error");
  }, []);

  useEffect(() => {
    if (!widgetScriptReady || !brandId || initializedRef.current) return;
    initializedRef.current = true;

    const zone = zoneRef.current;
    const jq = window.jQuery;
    if (!zone || typeof jq !== "function") {
      onFallbackRef.current("load_error");
      return;
    }

    // NEXT_PUBLIC_MONDIAL_RELAY_PARCEL_SIZE : le widget v4 n'a pas d'option
    // "taille de colis" — XL bascule sur le mode de livraison 24L, sinon 24R.
    const parcelSize = (configRef.current?.defaultParcelSize ?? "M").toUpperCase();
    const colLivMod = parcelSize === "XL" ? "24L" : "24R";
    const sanitizedZip = zipRef.current.trim().replace(/\s/g, "");
    const weight = weightRef.current;

    try {
      jq(zone).MR_ParcelShopPicker({
        Target: `#${WIDGET_TARGET_ID}`,
        // L'enseigne doit faire 8 caractères (complétée par des espaces).
        Brand: brandId.padEnd(8, " "),
        Country: "FR",
        PostCode: /^\d{4,5}$/.test(sanitizedZip) ? sanitizedZip : undefined,
        ColLivMod: colLivMod,
        Weight: weight > 0 ? String(weight) : undefined,
        NbResults: "7",
        Responsive: true,
        ShowResultsOnMap: true,
        WidgetLanguage: "FR",
        OnParcelShopSelected: (data) => {
          const point = mapSelectionToRelayPoint(data);
          if (point) onSelectRef.current(point);
        },
      });
    } catch {
      onFallbackRef.current("load_error");
      return;
    }

    // Le loader MR charge le bundle réel via XHR : un échec à cette étape ne
    // déclenche pas onError du <Script>. On vérifie que le widget a bien rendu.
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      if (zone.childElementCount === 0) {
        onFallbackRef.current("load_error");
      } else {
        setWidgetRendered(true);
      }
    }, WIDGET_RENDER_TIMEOUT_MS);
    const interval = window.setInterval(() => {
      if (zone.childElementCount > 0) {
        setWidgetRendered(true);
        window.clearInterval(interval);
        window.clearTimeout(timeout);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [widgetScriptReady, brandId]);

  return (
    <div className="space-y-2">
      {brandId ? (
        <Script
          src={JQUERY_SRC}
          strategy="lazyOnload"
          nonce={nonce}
          onLoad={() => setJqueryReady(true)}
          onError={handleScriptError}
        />
      ) : null}
      {brandId && jqueryReady ? (
        <Script
          src={MR_WIDGET_SRC}
          strategy="lazyOnload"
          nonce={nonce}
          onLoad={() => setWidgetScriptReady(true)}
          onError={handleScriptError}
        />
      ) : null}

      {!widgetRendered ? (
        <div
          className="text-muted-foreground flex min-h-24 items-center justify-center gap-2 rounded-xl border border-dashed text-sm"
          role="status"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Chargement de la carte Mondial Relay…
        </div>
      ) : null}

      <div
        id={WIDGET_ZONE_ID}
        ref={zoneRef}
        className="overflow-hidden rounded-xl border [&:empty]:hidden"
        aria-label="Carte de sélection d'un point relais Mondial Relay"
      />
      {/* Champ requis par l'option Target du widget (reçoit l'ID du point). */}
      <input
        type="hidden"
        id={WIDGET_TARGET_ID}
        aria-hidden="true"
        tabIndex={-1}
        readOnly
      />

      {!isProduction && brandId === MR_TEST_BRAND_ID ? (
        <p className="text-muted-foreground text-xs">
          Mode développement : enseigne de test Mondial Relay ({MR_TEST_BRAND_ID}).
        </p>
      ) : null}
    </div>
  );
}
