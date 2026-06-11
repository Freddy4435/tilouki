import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { legalMetadata } from "@/lib/seo/legal-metadata";

export const revalidate = 3600;

export const metadata: Metadata = legalMetadata.cookies;

export default function CookiesPage() {
  return (
    <LegalPage
      slug="cookies"
      fallbackTitle="Politique de cookies"
      fallbackMessage="Politique de cookies."
    />
  );
}
