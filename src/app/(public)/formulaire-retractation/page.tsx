import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { legalMetadata } from "@/lib/seo/legal-metadata";

export const revalidate = 3600;

export const metadata: Metadata = legalMetadata.formulaireRetractation;

export default function FormulaireRetractationPage() {
  return (
    <LegalPage
      slug="formulaire-retractation"
      fallbackTitle="Formulaire type de rétractation"
      fallbackMessage="Contenu éditable depuis l'administration."
    />
  );
}
