"use client";

import { useEffect, useState } from "react";

import type { MondialRelayWidgetConfig, RelayPoint } from "@/lib/mondial-relay/types";

interface MondialRelayWidgetProps {
  onSelect: (point: RelayPoint) => void;
  zip?: string;
  weightGrams?: number;
}

/**
 * Intégration widget Mondial Relay (V2).
 * Charge la configuration et affiche un placeholder jusqu'à branchement du script officiel.
 */
export function MondialRelayWidget({ onSelect, zip, weightGrams }: MondialRelayWidgetProps) {
  const [config, setConfig] = useState<MondialRelayWidgetConfig | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/shipping/widget-config");
        if (!response.ok) return;
        const data = (await response.json()) as MondialRelayWidgetConfig;
        if (!cancelled) setConfig(data);
      } catch {
        /* widget optionnel */
      }
    }

    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!config?.enabled) {
    return null;
  }

  return (
    <div className="border-primary/30 bg-muted/30 rounded-xl border border-dashed p-4 text-sm">
      <p className="font-medium">Widget Mondial Relay (bientôt disponible)</p>
      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
        Enseigne {config.brandId} — le sélecteur carte Mondial Relay sera intégré ici en V2.
        {zip ? ` Code postal : ${zip}.` : ""}
        {weightGrams ? ` Poids colis : ${weightGrams} g.` : ""}
      </p>
      <button
        type="button"
        className="text-primary mt-2 text-xs underline"
        onClick={() =>
          onSelect({
            id: `WIDGET-PLACEHOLDER-${config.brandId}`,
            name: "Point relais widget (V2)",
            address: "À sélectionner sur la carte",
            zip: zip ?? "",
            city: "",
            country: "FR",
          })
        }
      >
        Simuler une sélection widget
      </button>
    </div>
  );
}
