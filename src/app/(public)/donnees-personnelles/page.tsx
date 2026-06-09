import type { Metadata } from "next";

import { DataRequestForm } from "@/components/gdpr/data-request-form";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Vos données personnelles",
  description:
    "Exercez vos droits RGPD : accès, rectification ou demande de suppression de vos données.",
  path: "/donnees-personnelles",
});

export default function DonneesPersonnellesPage() {
  return (
    <div className="container-tilouki section-tilouki max-w-2xl">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Vos données personnelles</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Conformément au RGPD, vous pouvez demander l&apos;accès à vos données ou leur suppression.
          Nous traitons votre demande sous 30 jours.
        </p>
      </header>

      <DataRequestForm />
    </div>
  );
}
