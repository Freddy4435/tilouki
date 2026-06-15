"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateShippingRate } from "@/lib/shipping/rates";
import { formatShippingMethod, formatShippingProvider } from "@/lib/shipping/labels";
import { suggestNextSortOrder } from "@/lib/validations/admin-shipping-rate";
import type { CarrierName } from "@/lib/shipping/types";
import type { AdminShippingRate } from "@/lib/supabase/queries/admin/shipping-rates";
import { cn, formatPrice } from "@/lib/utils";
import {
  reorderShippingRateAction,
  saveShippingRateAction,
  setShippingRateActiveAction,
} from "@/server/actions/admin/shipping-rates";

const CARRIERS: CarrierName[] = ["mondial_relay", "chronopost"];

interface ShippingRatesManagerProps {
  rates: AdminShippingRate[];
  /** Transporteurs réellement proposés au checkout (env configurée ou mock dev). */
  configuredCarriers: CarrierName[];
}

function centsToEuroInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function ShippingRatesManager({
  rates,
  configuredCarriers,
}: ShippingRatesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [carrier, setCarrier] = useState<CarrierName>("mondial_relay");
  const [editingRate, setEditingRate] = useState<AdminShippingRate | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  /** Force le remontage du formulaire pour réinitialiser les defaultValue. */
  const [formKey, setFormKey] = useState(0);
  const [simulatorWeight, setSimulatorWeight] = useState("400");

  const carrierRates = useMemo(
    () =>
      rates
        .filter((rate) => rate.provider === carrier)
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.minWeightGrams - b.minWeightGrams,
        ),
    [rates, carrier],
  );

  const activeRates = useMemo(
    () => carrierRates.filter((rate) => rate.isActive),
    [carrierRates],
  );

  const simulator = useMemo(() => {
    const weight = Number(simulatorWeight);
    if (!Number.isFinite(weight) || weight <= 0 || activeRates.length === 0) {
      return null;
    }
    const result = calculateShippingRate(weight, activeRates);
    return {
      priceCents: result.priceCents,
      label: result.rate.label,
      aboveMax: weight > result.rate.maxWeightGrams,
    };
  }, [simulatorWeight, activeRates]);

  const selectCarrier = (next: CarrierName) => {
    setCarrier(next);
    setEditingRate(null);
    setIsActive(true);
    setFormError(null);
    setTableError(null);
    setFormKey((k) => k + 1);
  };

  const startEdit = (rate: AdminShippingRate) => {
    setEditingRate(rate);
    setIsActive(rate.isActive);
    setFormError(null);
    setFormKey((k) => k + 1);
  };

  const cancelEdit = () => {
    setEditingRate(null);
    setIsActive(true);
    setFormError(null);
    setFormKey((k) => k + 1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("provider", carrier);
    if (editingRate) form.set("id", editingRate.id);
    if (isActive) form.set("isActive", "on");

    startTransition(async () => {
      setFormError(null);
      const result = await saveShippingRateAction(form);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      cancelEdit();
      router.refresh();
    });
  };

  const reorderRate = (rate: AdminShippingRate, direction: "up" | "down") => {
    const form = new FormData();
    form.set("id", rate.id);
    form.set("direction", direction);

    startTransition(async () => {
      setTableError(null);
      const result = await reorderShippingRateAction(form);
      if (result.error) {
        setTableError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const toggleActive = (rate: AdminShippingRate) => {
    const form = new FormData();
    form.set("id", rate.id);
    if (!rate.isActive) form.set("isActive", "on");

    startTransition(async () => {
      setTableError(null);
      const result = await setShippingRateActiveAction(form);
      if (result.error) {
        setTableError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Onglets transporteurs */}
      <div
        role="tablist"
        aria-label="Transporteurs"
        className="bg-muted inline-flex rounded-full p-1"
      >
        {CARRIERS.map((name) => (
          <Button
            key={name}
            type="button"
            role="tab"
            size="sm"
            aria-selected={carrier === name}
            variant={carrier === name ? "default" : "ghost"}
            className="rounded-full"
            onClick={() => selectCarrier(name)}
          >
            {formatShippingProvider(name)}
            {!configuredCarriers.includes(name) ? (
              <Badge variant="outline" className="ml-1 text-[10px]">
                non proposé
              </Badge>
            ) : null}
          </Button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {tableError ? (
            <p className="text-destructive text-sm" role="alert">
              {tableError}
            </p>
          ) : null}

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead className="text-right">Poids min (g)</TableHead>
                  <TableHead className="text-right">Poids max (g)</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Ordre</TableHead>
                  <TableHead className="w-0" aria-label="Actions" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {carrierRates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-muted-foreground h-24 text-center text-sm"
                    >
                      Aucune tranche pour ce transporteur.
                    </TableCell>
                  </TableRow>
                ) : (
                  carrierRates.map((rate, index) => (
                    <TableRow
                      key={rate.id}
                      className={cn(
                        editingRate?.id === rate.id && "bg-primary/5",
                        !rate.isActive && "opacity-60",
                      )}
                    >
                      <TableCell className="font-medium">{rate.label}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatShippingMethod(rate.shippingMethod)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {rate.minWeightGrams}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {rate.maxWeightGrams}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(rate.priceCents)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rate.isActive ? "default" : "secondary"}>
                          {rate.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {rate.sortOrder}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            disabled={isPending || index === 0}
                            onClick={() => reorderRate(rate, "up")}
                            aria-label={`Monter la tranche ${rate.label}`}
                          >
                            <ArrowUp className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            disabled={isPending || index === carrierRates.length - 1}
                            onClick={() => reorderRate(rate, "down")}
                            aria-label={`Descendre la tranche ${rate.label}`}
                          >
                            <ArrowDown className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(rate)}
                            aria-label={`Modifier la tranche ${rate.label}`}
                          >
                            <Pencil className="size-3.5" />
                            Modifier
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() => toggleActive(rate)}
                          >
                            {rate.isActive ? "Désactiver" : "Activer"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Simulateur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Simulateur — {formatShippingProvider(carrier)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="simulator-weight">Poids du colis (g)</Label>
                <Input
                  id="simulator-weight"
                  inputMode="numeric"
                  className="w-36"
                  value={simulatorWeight}
                  onChange={(event) => setSimulatorWeight(event.target.value)}
                />
              </div>
              <div className="pb-1 text-sm">
                {simulator ? (
                  <>
                    <span className="text-muted-foreground">Frais facturés : </span>
                    <span className="text-base font-semibold tabular-nums">
                      {formatPrice(simulator.priceCents)}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      — tranche {simulator.label}
                      {simulator.aboveMax
                        ? " (poids au-delà du barème : tranche la plus élevée appliquée)"
                        : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {activeRates.length === 0
                      ? "Aucune tranche active — le barème par défaut du code serait appliqué."
                      : "Saisissez un poids valide."}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulaire ajout / édition */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {editingRate ? `Modifier « ${editingRate.label} »` : "Nouvelle tranche"}
            </CardTitle>
            {editingRate ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                aria-label="Annuler la modification"
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form key={formKey} onSubmit={onSubmit} className="space-y-4">
              <input
                type="hidden"
                name="shippingMethod"
                value={editingRate?.shippingMethod ?? "relay_point"}
              />
              <div className="bg-muted/40 rounded-lg border px-3 py-2 text-sm">
                <p className="text-muted-foreground text-xs">Transporteur</p>
                <p className="font-medium">{formatShippingProvider(carrier)}</p>
                <p className="text-muted-foreground mt-2 text-xs">Méthode</p>
                <p>
                  {formatShippingMethod(editingRate?.shippingMethod ?? "relay_point")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-label">Libellé *</Label>
                <Input
                  id="rate-label"
                  name="label"
                  defaultValue={editingRate?.label}
                  placeholder="251 – 500 g"
                  required
                />
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Les tranches actives d&apos;un transporteur proposé au checkout doivent
                couvrir les poids de façon continue à partir de 0 g (ex. 0–250 g, puis
                251–500 g), sans chevauchement.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rate-min">Poids min (g) *</Label>
                  <Input
                    id="rate-min"
                    name="minWeightGrams"
                    type="number"
                    min={0}
                    defaultValue={editingRate?.minWeightGrams ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-max">Poids max (g) *</Label>
                  <Input
                    id="rate-max"
                    name="maxWeightGrams"
                    type="number"
                    min={1}
                    defaultValue={editingRate?.maxWeightGrams ?? ""}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rate-price">Prix (€) *</Label>
                  <Input
                    id="rate-price"
                    name="priceEuros"
                    inputMode="decimal"
                    defaultValue={
                      editingRate ? centsToEuroInput(editingRate.priceCents) : ""
                    }
                    placeholder="4,90"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-sortOrder">Ordre</Label>
                  <Input
                    id="rate-sortOrder"
                    name="sortOrder"
                    type="number"
                    min={0}
                    defaultValue={
                      editingRate?.sortOrder ?? suggestNextSortOrder(carrierRates)
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rate-isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                />
                <Label htmlFor="rate-isActive">Tranche active</Label>
              </div>
              {formError ? (
                <p className="text-destructive text-sm" role="alert">
                  {formError}
                </p>
              ) : null}
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  "Enregistrement…"
                ) : editingRate ? (
                  "Mettre à jour"
                ) : (
                  <>
                    <Plus className="size-4" />
                    Ajouter la tranche
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
