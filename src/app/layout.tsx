import type { Metadata } from "next";
import { headers } from "next/headers";

import { brandAssets, siteConfig } from "@/lib/constants/site";
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
  icons: {
    icon: [
      { url: brandAssets.favicon.ico, sizes: "any" },
      { url: brandAssets.favicon.png32, sizes: "32x32", type: "image/png" },
      { url: brandAssets.favicon.png64, sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: brandAssets.favicon.png180, sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: brandAssets.favicon.png192,
        sizes: "192x192",
        type: "image/png",
      },
    ],
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
