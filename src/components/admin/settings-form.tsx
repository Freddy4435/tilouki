"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { ApplyVerifiedIdentityButton } from "@/components/admin/apply-verified-identity-button";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";
import { EditorialBlocksManager } from "@/components/admin/editorial-blocks-manager";
import { GdprAdminPanel } from "@/components/admin/gdpr-admin-panel";
import { HeroImageUpload } from "@/components/admin/hero-image-upload";
import { LegalComplianceAlert } from "@/components/admin/legal-compliance-alert";
import { LegalComplianceChecklist } from "@/components/admin/legal-compliance-checklist";
import { LegalProfessionalNotice } from "@/components/admin/legal-professional-notice";
import { SellerIdentityVerifyNotice } from "@/components/admin/seller-identity-verify-notice";
import { SiretImportButton } from "@/components/admin/siret-import-button";
import { SocialLinksFields } from "@/components/admin/social-links-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminShopSettings } from "@/lib/supabase/queries/admin/settings";
import type { LegalComplianceInput } from "@/lib/legal/compliance";
import { parseShopAnnouncementsJson } from "@/lib/announcements/validation";
import { parseEditorialBlocksJson } from "@/lib/editorial/validation";
import { parseShopSocialLinksJson } from "@/lib/social/validation";
import { updateShopSettingsAction } from "@/server/actions/admin/settings";

interface SettingsFormProps {
  settings: AdminShopSettings;
  legalCompliance?: LegalComplianceInput | null;
}

export function SettingsForm({ settings, legalCompliance }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [vatEnabled, setVatEnabled] = useState(settings.vatEnabled);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(settings.analyticsEnabled);
  const legalNameRef = useRef<HTMLInputElement>(null);
  const legalStatusRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  const complianceInput = legalCompliance ?? {
    shopName: settings.shopName,
    legalName: settings.persistedSellerIdentity.legalName,
    legalStatus: settings.persistedSellerIdentity.legalStatus,
    siret: settings.persistedSellerIdentity.siret,
    address: settings.persistedSellerIdentity.address,
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
    analyticsEnabled: settings.analyticsEnabled,
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (vatEnabled) form.set("vatEnabled", "on");
    if (analyticsEnabled) form.set("analyticsEnabled", "on");

    startTransition(async () => {
      setError(null);
      const announcementsParsed = parseShopAnnouncementsJson(form.get("announcements"));
      if (!announcementsParsed.ok) {
        setError(announcementsParsed.error);
        return;
      }
      const socialLinksParsed = parseShopSocialLinksJson(form.get("socialLinks"));
      if (!socialLinksParsed.ok) {
        setError(socialLinksParsed.error);
        return;
      }
      const editorialParsed = parseEditorialBlocksJson(form.get("editorialBlocks"));
      if (!editorialParsed.ok) {
        setError(editorialParsed.error);
        return;
      }
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
      <LegalProfessionalNotice />
      <LegalComplianceAlert settings={complianceInput} />

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold">
          Vitrine — page d&apos;accueil
        </legend>
        <HeroImageUpload currentUrl={settings.heroImageUrl} />
      </fieldset>

      <form onSubmit={onSubmit} className="grid gap-6">
        <input type="hidden" name="id" value={settings.id} />

        <AnnouncementsManager
          enabled={settings.announcementsEnabled}
          announcements={settings.announcements}
        />

        <SocialLinksFields links={settings.socialLinks} />

        <EditorialBlocksManager blocks={settings.editorialBlocks} />

        <fieldset className="space-y-4 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Identité du vendeur</legend>
          <SellerIdentityVerifyNotice
            suggestedFields={settings.suggestedSellerIdentityFields}
          />
          <p className="text-muted-foreground text-xs">
            Ces informations alimentent les mentions légales, CGV et formulaire de
            rétractation.
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
                ref={legalNameRef}
                placeholder="Prénom Nom"
                defaultValue={settings.legalName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalStatus">Statut juridique *</Label>
              <Input
                id="legalStatus"
                name="legalStatus"
                ref={legalStatusRef}
                placeholder="Auto-entrepreneur"
                defaultValue={settings.legalStatus ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="siret">SIRET *</Label>
              <Input
                id="siret"
                name="siret"
                placeholder="14 chiffres"
                inputMode="numeric"
                defaultValue={settings.siret ?? ""}
              />
              <SiretImportButton
                fieldRefs={{
                  legalName: legalNameRef,
                  legalStatus: legalStatusRef,
                  address: addressRef,
                }}
              />
              <ApplyVerifiedIdentityButton
                fieldRefs={{
                  legalName: legalNameRef,
                  legalStatus: legalStatusRef,
                  address: addressRef,
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de contact client *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contact@exemple.fr"
                defaultValue={settings.email ?? ""}
              />
              <p className="text-muted-foreground text-xs">
                Adresse affichée aux clients et utilisée pour les réclamations
                (checkout, CGV, suivi commande).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone de contact *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="06 00 00 00 00"
                defaultValue={settings.phone ?? ""}
              />
              <p className="text-muted-foreground text-xs">
                Numéro joignable pour le service client — obligatoire en mentions
                légales.
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Adresse professionnelle *</Label>
              <textarea
                id="address"
                name="address"
                ref={addressRef}
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
            Décochez si vous bénéficiez de la franchise en base (art. 293 B du CGI).
            Taux actuel : {settings.vatRate}% — devise : {settings.currency}
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
          <legend className="px-1 text-sm font-semibold">
            Médiation & REP textile
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="mediationName">
                Médiateur de la consommation — nom *
              </Label>
              <Input
                id="mediationName"
                name="mediationName"
                placeholder="Nom du médiateur agréé"
                defaultValue={settings.mediationName ?? ""}
              />
              <p className="text-muted-foreground text-xs">
                Médiateur agréé — voir la liste sur le site du{" "}
                <a
                  href="https://www.economie.gouv.fr/cecmc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  CECMC
                </a>
                .
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="mediationUrl">Médiateur — URL de saisine *</Label>
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
                placeholder="Ex. FRxxxxxxxxx"
                defaultValue={settings.repIdu ?? ""}
              />
              <p className="text-muted-foreground text-xs">
                IDU délivré par Refashion / ADEME si vous êtes adhérent à un
                éco-organisme textile ou REP emballages — laissez vide si non concerné.
                Affiché dans le footer et les mentions légales lorsqu&apos;il est
                renseigné.
              </p>
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
            Ces textes alimentent les CGV et la page Livraison &amp; retours. À valider
            avec un professionnel du droit.
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
          <legend className="px-1 text-sm font-semibold">
            Cookies & mesure d&apos;audience
          </legend>
          <div className="flex items-center gap-2">
            <Checkbox
              id="analyticsEnabled"
              checked={analyticsEnabled}
              onCheckedChange={(checked) => setAnalyticsEnabled(checked === true)}
            />
            <Label htmlFor="analyticsEnabled">
              Prévoir un outil de mesure d&apos;audience (consentement requis via le
              bandeau cookies)
            </Label>
          </div>
          <p className="text-muted-foreground text-xs">
            Si coché, la politique cookies mentionne l&apos;analytics. Configurez{" "}
            <code className="bg-muted rounded px-1">NEXT_PUBLIC_PLAUSIBLE_DOMAIN</code>{" "}
            pour charger Plausible uniquement après consentement.
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

      <LegalComplianceChecklist settings={complianceInput} shopFieldsOnly />
      <GdprAdminPanel />
    </div>
  );
}
