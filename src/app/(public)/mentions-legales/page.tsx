import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { legalMetadata } from "@/lib/seo/legal-metadata";

export const revalidate = 3600;

export const metadata: Metadata = legalMetadata.mentionsLegales;

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      slug="mentions-legales"
      fallbackTitle="Mentions légales"
      fallbackMessage="Page en cours de chargement."
    />
  );
}
