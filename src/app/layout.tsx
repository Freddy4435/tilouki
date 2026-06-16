import type { Metadata } from "next";

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
    apple: [{ url: brandAssets.favicon.png180, sizes: "180x180", type: "image/png" }],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // CSP à nonce : générée par requête dans src/proxy.ts (voir docs/performance-cache-tilouki.md).
  // Pas de headers() ici — évite un second opt-in dynamique inutile ; les scripts Next.js
  // lisent Content-Security-Policy depuis les en-têtes de la requête (middleware).
  return (
    <html lang="fr" className={`${fontVariables} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
