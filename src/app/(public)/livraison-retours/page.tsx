import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { legalMetadata } from "@/lib/seo/legal-metadata";

export const revalidate = 3600;

export const metadata: Metadata = legalMetadata.livraisonRetours;

export default function LivraisonRetoursPage() {
  return (
    <LegalPage
      slug="livraison-retours"
      fallbackTitle="Livraison et retours"
      fallbackMessage="Informations livraison et retours."
    />
  );
}
