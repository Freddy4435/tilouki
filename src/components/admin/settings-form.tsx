"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { HeroImageUpload } from "@/components/admin/hero-image-upload";
import { LegalComplianceAlert } from "@/components/admin/legal-compliance-alert";
import { LegalComplianceChecklist } from "@/components/admin/legal-compliance-checklist";
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
  const [analyticsEnabled, setAnalyticsEnabled] = useState(settings.analyticsEnabled);

  const complianceInput = {
    shopName: settings.shopName,
    legalName: settings.legalName,
    legalStatus: settings.legalStatus,
    siret: settings.siret,
    address: settings.address,
    email: settings.email,
    phone: settings.phone,
    vatEnabled: settings.vatEnabled,
    vatNotice: settings.vatNotice,
    mediationName: settings.mediationName,
    mediationUrl: settings.mediationUrl,
    repIdu: settings.repIdu,
    hostName: settings.hostName,
    hostAddress: settings.hostAddress,
    hostPhone: settings.hostPhone,
    hostEmail: settings.hostEmail,
    returnPolicy: settings.returnPolicy,
    exchangePolicy: settings.exchangePolicy,
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (vatEnabled) form.set("vatEnabled", "on");
    if (analyticsEnabled) form.set("analyticsEnabled", "on");

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
    <div className="grid max-w-3xl gap-6">
      <LegalComplianceAlert settings={complianceInput} />

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold">Vitrine — page d&apos;accueil</legend>
        <HeroImageUpload currentUrl={settings.heroImageUrl} />
      </fieldset>

      <form onSubmit={onSubmit} className="grid gap-6">
        <input type="hidden" name="id" value={settings.id} />

        <fieldset className="space-y-4 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Identité du vendeur</legend>
          <p className="text-muted-foreground text-xs">
            Ces informations alimentent les mentions légales, CGV et formulaire de rétractation.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="shopName">Nom commercial *</Label>
              <Input
                id="shopName"
                name="shopName"
                placeholder="Tilouki"
                defaultValue={settings.shopName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalName">Nom légal / raison sociale *</Label>
              <Input
                id="legalName"
                name="legalName"
                placeholder="Prénom Nom"
                defaultValue={settings.legalName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalStatus">Statut juridique *</Label>
              <Input
                id="legalStatus"
                name="legalStatus"
                placeholder="Auto-entrepreneur"
                defaultValue={settings.legalStatus ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET *</Label>
              <Input
                id="siret"
                name="siret"
                placeholder="14 chiffres"
                inputMode="numeric"
                defaultValue={settings.siret ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de contact *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contact@exemple.fr"
                defaultValue={settings.email ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="06 00 00 00 00"
                defaultValue={settings.phone ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Adresse professionnelle *</Label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Numéro, rue, code postal, ville"
                defaultValue={settings.address ?? ""}
                className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">TVA</legend>
          <div className="flex items-center gap-2">
            <Checkbox
              id="vatEnabled"
              checked={vatEnabled}
              onCheckedChange={(checked) => setVatEnabled(checked === true)}
            />
            <Label htmlFor="vatEnabled">Assujetti à la TVA</Label>
          </div>
          <p className="text-muted-foreground text-xs">
            Décochez si vous bénéficiez de la franchise en base (art. 293 B du CGI). Taux actuel :{" "}
            {settings.vatRate}% — devise : {settings.currency}
          </p>
          <div className="space-y-2">
            <Label htmlFor="vatNotice">Mention TVA affichée</Label>
            <textarea
              id="vatNotice"
              name="vatNotice"
              rows={2}
              placeholder="TVA non applicable, article 293 B du CGI (franchise en base de TVA)."
              defaultValue={settings.vatNotice ?? ""}
              className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Médiation & REP textile</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="mediationName">Médiateur de la consommation — nom *</Label>
              <Input
                id="mediationName"
                name="mediationName"
                placeholder="Nom du médiateur agréé"
                defaultValue={settings.mediationName ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="mediationUrl">Médiateur — URL *</Label>
              <Input
                id="mediationUrl"
                name="mediationUrl"
                type="url"
                placeholder="https://…"
                defaultValue={settings.mediationUrl ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="repIdu">Identifiant unique REP textile (IDU)</Label>
              <Input
                id="repIdu"
                name="repIdu"
                placeholder="Si inscrit à un éco-organisme textile"
                defaultValue={settings.repIdu ?? ""}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Hébergeur du site</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hostName">Nom *</Label>
              <Input
                id="hostName"
                name="hostName"
                placeholder="Vercel Inc."
                defaultValue={settings.hostName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostEmail">E-mail *</Label>
              <Input
                id="hostEmail"
                name="hostEmail"
                type="email"
                placeholder="support@hebergeur.com"
                defaultValue={settings.hostEmail ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostPhone">Téléphone</Label>
              <Input
                id="hostPhone"
                name="hostPhone"
                type="tel"
                defaultValue={settings.hostPhone ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hostAddress">Adresse *</Label>
              <textarea
                id="hostAddress"
                name="hostAddress"
                rows={2}
                placeholder="Adresse complète de l'hébergeur"
                defaultValue={settings.hostAddress ?? ""}
                className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Retours & échanges</legend>
          <p className="text-muted-foreground text-xs">
            Ces textes alimentent les CGV et la page Livraison &amp; retours. À valider avec un professionnel du
            droit.
          </p>
          <div className="space-y-2">
            <Label htmlFor="returnPolicy">Politique retours / rétractation *</Label>
            <textarea
              id="returnPolicy"
              name="returnPolicy"
              rows={4}
              placeholder="Frais de retour à la charge du client sauf erreur du vendeur. Remboursement sous 14 jours après réception du retour…"
              defaultValue={settings.returnPolicy ?? ""}
              className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exchangePolicy">Politique échange de taille</Label>
            <textarea
              id="exchangePolicy"
              name="exchangePolicy"
              rows={2}
              placeholder="Retour puis nouvelle commande sous réserve du stock disponible…"
              defaultValue={settings.exchangePolicy ?? ""}
              className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Cookies & mesure d&apos;audience</legend>
          <div className="flex items-center gap-2">
            <Checkbox
              id="analyticsEnabled"
              checked={analyticsEnabled}
              onCheckedChange={(checked) => setAnalyticsEnabled(checked === true)}
            />
            <Label htmlFor="analyticsEnabled">
              Prévoir un outil de mesure d&apos;audience (consentement requis via le bandeau cookies)
            </Label>
          </div>
          <p className="text-muted-foreground text-xs">
            Si coché, la politique cookies mentionne l&apos;analytics. Configurez{" "}
            <code className="bg-muted rounded px-1">NEXT_PUBLIC_PLAUSIBLE_DOMAIN</code> pour charger Plausible
            uniquement après consentement.
          </p>
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

      <LegalComplianceChecklist settings={complianceInput} />
    </div>
  );
}
