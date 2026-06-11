"use client";

import { useCallback, useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { AlertTriangle, Clock, List, Loader2, Map, MapPin, Search } from "lucide-react";

import {
  MondialRelayMapPicker,
  type MapPickerFallbackReason,
} from "@/components/shipping/mondial-relay-map-picker";
import { CarrierSelector } from "@/components/shipping/carrier-selector";
import { FormField } from "@/components/checkout/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartShipping } from "@/hooks/use-cart-shipping";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
import { isClientRelayPointSelectable } from "@/lib/shipping/client-guards";
import type { CarrierName, RelayPoint, RelayPointSource } from "@/lib/shipping/types";
import { cn } from "@/lib/utils";

interface RelayPointSelectorProps {
  form: UseFormReturn<CheckoutFormValues>;
  /** Nonce CSP de la requête — requis par les <Script> du widget Mondial Relay. */
  nonce?: string;
}

type SelectionMode = "map" | "list";

/** Carte par défaut sur desktop, liste sur mobile (widget MR peu adapté au petit écran). */
function defaultSelectionMode(): SelectionMode {
  if (typeof window === "undefined") return "list";
  return window.matchMedia("(min-width: 768px)").matches ? "map" : "list";
}

interface RelaySearchResponse {
  points: RelayPoint[];
  source: RelayPointSource;
  configured: boolean;
  devMock?: boolean;
  message?: string;
  error?: string;
}

export function RelayPointSelector({ form, nonce }: RelayPointSelectorProps) {
  const carrier = useCartStore((s) => s.carrier);
  const setCarrier = useCartStore((s) => s.setCarrier);
  const { shippingCents, totalWeightGrams, rateLabel, isLoadingRates, carriers, quotes } =
    useCartShipping();
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedPoint = watch("relayPoint");
  const [searchZip, setSearchZip] = useState(selectedPoint?.zip ?? "");
  const [searchCity, setSearchCity] = useState(selectedPoint?.city ?? "");
  const [points, setPoints] = useState<RelayPoint[]>([]);
  const [searchSource, setSearchSource] = useState<RelayPointSource | null>(null);
  const [isDevMock, setIsDevMock] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<SelectionMode>(defaultSelectionMode);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [mapFallbackMessage, setMapFallbackMessage] = useState<string | null>(null);

  /** Le widget carte est propre à Mondial Relay. */
  const isMapSupported = carrier === "mondial_relay" && !mapUnavailable;
  const effectiveMode: SelectionMode = isMapSupported ? mode : "list";

  // Transporteur persisté devenu indisponible (ex. Chronopost déconfiguré) → repli.
  useEffect(() => {
    if (isLoadingRates || carriers.length === 0) return;
    if (!carriers.some((info) => info.id === carrier)) {
      setCarrier(carriers[0]!.id);
    }
  }, [carrier, carriers, isLoadingRates, setCarrier]);

  const clearSearchResults = useCallback(() => {
    setPoints([]);
    setSearchSource(null);
    setIsDevMock(false);
    setSearchError(null);
    setInfoMessage(null);
  }, []);

  const handleCarrierChange = (next: CarrierName) => {
    if (next === carrier) return;
    setCarrier(next);
    clearSearchResults();
    // Le point sélectionné appartient à l'ancien transporteur : on le retire.
    setValue(
      "relayPoint",
      { id: "", name: "", address: "", zip: "", city: "", country: "FR" },
      { shouldValidate: false, shouldDirty: true },
    );
  };

  const handleMapFallback = useCallback((reason: MapPickerFallbackReason) => {
    setMapUnavailable(true);
    setMode("list");
    if (reason === "load_error") {
      setMapFallbackMessage(
        "La carte n'a pas pu être chargée — utilisez la recherche par code postal ci-dessous.",
      );
    }
  }, []);

  const searchPoints = async () => {
    const zip = searchZip.trim();
    const city = searchCity.trim();

    if (zip.length < 4 && city.length < 2) {
      setSearchError("Saisissez un code postal (4 caractères) ou une ville (2 caractères minimum).");
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
        country: "FR",
        weightGrams: String(totalWeightGrams),
        carrier,
      });
      if (zip.length >= 4) params.set("zip", zip);
      if (city.length >= 2) params.set("city", city);

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
        setSearchError(
          data.error ?? "Aucun point relais trouvé pour cette recherche.",
        );
      }
    } catch {
      setSearchError("Recherche impossible. Vérifiez votre connexion.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectPoint = (point: RelayPoint) => {
    if (process.env.NODE_ENV === "production" && point.isDevMock) {
      setSearchError("Ce point relais de test n'est pas utilisable en production.");
      return;
    }

    setValue(
      "relayPoint",
      {
        id: point.id,
        name: point.name,
        address: point.address,
        zip: point.zip,
        city: point.city,
        country: point.country,
        ...(point.openingHours ? { openingHours: point.openingHours } : {}),
      },
      { shouldValidate: true, shouldDirty: true },
    );
  };

  return (
    <div className="space-y-5">
      <CarrierSelector
        carriers={carriers}
        quotes={quotes}
        selected={carrier}
        onSelect={handleCarrierChange}
        isLoading={isLoadingRates}
      />

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

      {isMapSupported ? (
        <div
          role="group"
          aria-label="Mode de sélection du point relais"
          className="bg-muted inline-flex rounded-full p-1"
        >
          <Button
            type="button"
            size="sm"
            variant={mode === "map" ? "default" : "ghost"}
            className="rounded-full"
            aria-pressed={mode === "map"}
            onClick={() => setMode("map")}
          >
            <Map className="size-4" aria-hidden="true" />
            Carte
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "list" ? "default" : "ghost"}
            className="rounded-full"
            aria-pressed={mode === "list"}
            onClick={() => setMode("list")}
          >
            <List className="size-4" aria-hidden="true" />
            Liste
          </Button>
        </div>
      ) : null}

      {mapFallbackMessage ? (
        <p className="text-muted-foreground text-xs" role="status">
          {mapFallbackMessage}
        </p>
      ) : null}

      {isMapSupported ? (
        <div className={effectiveMode === "map" ? undefined : "hidden"}>
          <MondialRelayMapPicker
            zip={searchZip}
            weightGrams={totalWeightGrams}
            nonce={nonce}
            onSelect={selectPoint}
            onFallback={handleMapFallback}
          />
        </div>
      ) : null}

      <div className={cn("space-y-5", effectiveMode === "map" ? "hidden" : undefined)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <FormField id="relaySearchZip" label="Code postal">
              <Input
                id="relaySearchZip"
                inputMode="numeric"
                autoComplete="postal-code"
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
            <FormField id="relaySearchCity" label="Ville (optionnel)">
              <Input
                id="relaySearchCity"
                autoComplete="address-level2"
                placeholder="Paris"
                value={searchCity}
                onChange={(event) => setSearchCity(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void searchPoints();
                  }
                }}
              />
            </FormField>
          </div>
          <Button
            type="button"
            className="w-full shrink-0 rounded-full sm:w-auto"
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
        <p className="text-muted-foreground text-xs">
          Recherchez par code postal, par ville, ou les deux pour affiner les résultats.
        </p>

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
            <ul className="max-h-[min(24rem,60vh)] space-y-2 overflow-y-auto pr-1">
              {points.map((point) => {
                const isSelected = selectedPoint?.id === point.id;
                return (
                  <li key={point.id}>
                    <button
                      type="button"
                      onClick={() => selectPoint(point)}
                      aria-pressed={isSelected}
                      className={cn(
                        "min-h-11 w-full rounded-xl border p-4 text-left text-sm transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/40 active:bg-muted/50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground",
                          )}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug">{point.name}</p>
                          <p className="text-muted-foreground mt-1 leading-relaxed">
                            {point.address}
                            <br />
                            {point.zip} {point.city}
                          </p>
                          {point.openingHours ? (
                            <p className="text-muted-foreground mt-2 flex items-start gap-1.5 text-xs leading-relaxed">
                              <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                              <span>{point.openingHours}</span>
                            </p>
                          ) : null}
                        </div>
                        {isSelected ? (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            Choisi
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Annonce de la sélection pour les lecteurs d'écran (carte ou liste). */}
      <p aria-live="polite" className="sr-only">
        {selectedPoint?.id
          ? `Point relais sélectionné : ${selectedPoint.name}, ${selectedPoint.zip} ${selectedPoint.city}.`
          : ""}
      </p>

      {selectedPoint?.id &&
      !isClientRelayPointSelectable(selectedPoint.id) &&
      process.env.NODE_ENV === "production" ? (
        <p className="text-destructive text-sm" role="alert">
          Le point relais sélectionné n&apos;est pas valide. Effectuez une nouvelle
          recherche.
        </p>
      ) : null}

      {selectedPoint?.id && isClientRelayPointSelectable(selectedPoint.id) ? (
        <div className="bg-tilouki-sage-light/30 rounded-xl border px-4 py-3 text-sm">
          <p className="font-medium">Point relais sélectionné</p>
          <p className="text-muted-foreground mt-1 leading-relaxed">
            {selectedPoint.name}
            <br />
            {selectedPoint.address}
            <br />
            {selectedPoint.zip} {selectedPoint.city} ({selectedPoint.country})
          </p>
          {"openingHours" in selectedPoint && selectedPoint.openingHours ? (
            <p className="text-muted-foreground mt-2 flex items-start gap-1.5 text-xs">
              <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{selectedPoint.openingHours}</span>
            </p>
          ) : null}
          <p className="text-muted-foreground mt-2 text-xs">Réf. {selectedPoint.id}</p>
        </div>
      ) : !selectedPoint?.id ? (
        <p className="text-muted-foreground text-sm">
          La sélection d&apos;un point relais est obligatoire pour continuer.
        </p>
      ) : null}

      {errors.relayPoint?.message || errors.relayPoint?.id?.message ? (
        <p className="text-destructive text-sm" role="alert">
          {errors.relayPoint?.message ?? errors.relayPoint?.id?.message}
        </p>
      ) : null}
    </div>
  );
}
