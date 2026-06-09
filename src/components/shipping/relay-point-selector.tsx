"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { AlertTriangle, Loader2, MapPin, Search } from "lucide-react";

import { MondialRelayWidget } from "@/components/shipping/mondial-relay-widget";
import { FormField } from "@/components/checkout/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartShipping } from "@/hooks/use-cart-shipping";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
import type { RelayPoint, RelayPointSource } from "@/lib/mondial-relay/types";
import { cn } from "@/lib/utils";

interface RelayPointSelectorProps {
  form: UseFormReturn<CheckoutFormValues>;
}

interface RelaySearchResponse {
  points: RelayPoint[];
  source: RelayPointSource;
  configured: boolean;
  devMock?: boolean;
  message?: string;
  error?: string;
}

export function RelayPointSelector({ form }: RelayPointSelectorProps) {
  const { shippingCents, totalWeightGrams, rateLabel, isLoadingRates } = useCartShipping();
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedPoint = watch("relayPoint");
  const [searchZip, setSearchZip] = useState(selectedPoint?.zip ?? "");
  const [points, setPoints] = useState<RelayPoint[]>([]);
  const [searchSource, setSearchSource] = useState<RelayPointSource | null>(null);
  const [isDevMock, setIsDevMock] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const searchPoints = async () => {
    const zip = searchZip.trim();
    if (zip.length < 4) {
      setSearchError("Saisissez un code postal valide.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setInfoMessage(null);
    setPoints([]);
    setSearchSource(null);
    setIsDevMock(false);

    try {
      const params = new URLSearchParams({
        zip,
        country: "FR",
        weightGrams: String(totalWeightGrams),
      });

      const response = await fetch(`/api/shipping/relay-points?${params.toString()}`);
      const data = (await response.json()) as RelaySearchResponse;

      setSearchSource(data.source);
      setIsDevMock(Boolean(data.devMock));
      setPoints(data.points ?? []);
      setInfoMessage(data.message ?? null);

      if (!data.configured) {
        setSearchError(data.error ?? "Service de points relais non configuré.");
        return;
      }

      if ((data.points ?? []).length === 0) {
        setSearchError(data.error ?? "Aucun point relais trouvé pour ce code postal.");
      }
    } catch {
      setSearchError("Recherche impossible. Vérifiez votre connexion.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectPoint = (point: RelayPoint) => {
    setValue(
      "relayPoint",
      {
        id: point.id,
        name: point.name,
        address: point.address,
        zip: point.zip,
        city: point.city,
        country: point.country,
      },
      { shouldValidate: true, shouldDirty: true },
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-muted/50 space-y-2 rounded-xl border px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Frais de livraison point relais</span>
          <span className="font-semibold tabular-nums">
            {isLoadingRates ? "…" : formatPrice(shippingCents)}
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          Poids estimé du colis : {totalWeightGrams} g — tranche {rateLabel}
        </p>
      </div>

      <MondialRelayWidget
        zip={searchZip}
        weightGrams={totalWeightGrams}
        onSelect={selectPoint}
      />

      <div className="flex gap-2">
        <FormField id="relaySearchZip" label="Code postal" className="flex-1">
          <Input
            id="relaySearchZip"
            inputMode="numeric"
            placeholder="75001"
            value={searchZip}
            onChange={(event) => setSearchZip(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void searchPoints();
              }
            }}
          />
        </FormField>
        <Button
          type="button"
          className="mt-6 shrink-0 rounded-full"
          onClick={() => void searchPoints()}
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          Rechercher
        </Button>
      </div>

      {isDevMock ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Mode développement — points relais fictifs</p>
            <p className="mt-1 text-xs opacity-90">
              Ces points ne sont pas réels. Configurez Mondial Relay en production.
            </p>
          </div>
        </div>
      ) : null}

      {searchError ? (
        <p className="text-destructive text-sm" role="alert">
          {searchError}
        </p>
      ) : null}

      {infoMessage && !searchError ? (
        <p className="text-muted-foreground text-xs">{infoMessage}</p>
      ) : null}

      {points.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Choisissez votre point relais</p>
            {searchSource === "dev_mock" ? (
              <Badge variant="outline" className="text-xs">
                DEV
              </Badge>
            ) : null}
          </div>
          <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {points.map((point) => {
              const isSelected = selectedPoint?.id === point.id;
              return (
                <li key={point.id}>
                  <button
                    type="button"
                    onClick={() => selectPoint(point)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left text-sm transition-colors",
                      isSelected ? "border-primary bg-primary/5" : "hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
                      <div>
                        <p className="font-medium">{point.name}</p>
                        <p className="text-muted-foreground mt-1">
                          {point.address}
                          <br />
                          {point.zip} {point.city}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">ID relais : {point.id}</p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {selectedPoint?.id ? (
        <div className="bg-tilouki-sage-light/30 rounded-xl border px-4 py-3 text-sm">
          <p className="font-medium">Point relais sélectionné</p>
          <p className="text-muted-foreground mt-1">
            {selectedPoint.name} — {selectedPoint.address}, {selectedPoint.zip}{" "}
            {selectedPoint.city} ({selectedPoint.country})
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Réf. {selectedPoint.id}</p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          La sélection d&apos;un point relais est obligatoire pour continuer.
        </p>
      )}

      {errors.relayPoint?.message || errors.relayPoint?.id?.message ? (
        <p className="text-destructive text-sm" role="alert">
          {errors.relayPoint?.message ?? errors.relayPoint?.id?.message}
        </p>
      ) : null}
    </div>
  );
}
