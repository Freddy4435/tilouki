"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminShopSettings } from "@/lib/supabase/queries/admin/settings";
import { updateShopSettingsAction } from "@/server/actions/admin/settings";

interface SettingsFormProps {
  settings: AdminShopSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [vatEnabled, setVatEnabled] = useState(settings.vatEnabled);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (vatEnabled) form.set("vatEnabled", "on");

    startTransition(async () => {
      setError(null);
      const result = await updateShopSettingsAction(form);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-6">
      <input type="hidden" name="id" value={settings.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="shopName">Nom de la boutique *</Label>
          <Input id="shopName" name="shopName" defaultValue={settings.shopName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="legalName">Raison sociale</Label>
          <Input id="legalName" name="legalName" defaultValue={settings.legalName ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="legalStatus">Statut juridique</Label>
          <Input id="legalStatus" name="legalStatus" defaultValue={settings.legalStatus ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siret">SIRET</Label>
          <Input id="siret" name="siret" defaultValue={settings.siret ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail contact</Label>
          <Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={settings.phone ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <textarea
            id="address"
            name="address"
            rows={3}
            defaultValue={settings.address ?? ""}
            className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          />
        </div>
      </div>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">TVA</legend>
        <div className="flex items-center gap-2">
          <Checkbox
            id="vatEnabled"
            checked={vatEnabled}
            onCheckedChange={(checked) => setVatEnabled(checked === true)}
          />
          <Label htmlFor="vatEnabled">TVA activée</Label>
        </div>
        <p className="text-muted-foreground text-xs">
          Taux actuel : {settings.vatRate}% — devise : {settings.currency}
        </p>
        <div className="space-y-2">
          <Label htmlFor="vatNotice">Mention TVA (franchise, etc.)</Label>
          <textarea
            id="vatNotice"
            name="vatNotice"
            rows={2}
            defaultValue={settings.vatNotice ?? ""}
            className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Informations légales complémentaires</legend>
        <p className="text-muted-foreground text-xs">
          Utilisées dans les pages légales via les variables automatiques (hébergeur, médiation, REP
          textile).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="mediationUrl">URL médiateur de la consommation</Label>
            <Input
              id="mediationUrl"
              name="mediationUrl"
              type="url"
              placeholder="https://…"
              defaultValue={settings.mediationUrl ?? ""}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="repIdu">Identifiant unique REP textile</Label>
            <Input
              id="repIdu"
              name="repIdu"
              placeholder="IDU — si applicable"
              defaultValue={settings.repIdu ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostName">Hébergeur — nom</Label>
            <Input id="hostName" name="hostName" defaultValue={settings.hostName ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostPhone">Hébergeur — téléphone</Label>
            <Input id="hostPhone" name="hostPhone" defaultValue={settings.hostPhone ?? ""} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="hostAddress">Hébergeur — adresse</Label>
            <textarea
              id="hostAddress"
              name="hostAddress"
              rows={2}
              defaultValue={settings.hostAddress ?? ""}
              className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement…" : "Enregistrer les paramètres"}
      </Button>
    </form>
  );
}
