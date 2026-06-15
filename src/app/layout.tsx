import type { Metadata } from "next";
import { headers } from "next/headers";

import { siteConfig } from "@/lib/constants/site";
import { fontVariables } from "@/lib/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Vêtements enfants`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // CSP à nonce : un nonce est unique par requête, le HTML ne peut donc pas
  // être pré-rendu (doc Next.js CSP). Lire headers() force le rendu dynamique
  // de toutes les pages pour que Next.js applique le nonce à ses scripts.
  await headers();

  return (
    <html lang="fr" className={`${fontVariables} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
