import localFont from "next/font/local";

/**
 * Typographie Tilouki — Cocon marchand 2026 (auto-hébergée, CI déterministe).
 * Régénérer : npm run fonts:fetch
 *
 * - DM Sans (`bodyFont`) : UI retail — formulaires, filtres, prix, checkout, cartes, titres rayon.
 * - Fraunces (`headingFont`) : hero, grands titres marque, rituels — pas les panneaux compacts.
 */
export const bodyFont = localFont({
  src: "../assets/fonts/dm-sans-latin.woff2",
  variable: "--font-body",
  display: "swap",
  weight: "400 700",
  preload: false,
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

/** Préchargée — utilisée par le H1 hero (élément LCP mobile accueil). */
export const headingFont = localFont({
  src: "../assets/fonts/fraunces-latin.woff2",
  variable: "--font-heading",
  display: "swap",
  weight: "400 700",
  preload: true,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "Cambria", "serif"],
});

/** Classes CSS variables à appliquer sur `<html>`. */
export const fontVariables = `${bodyFont.variable} ${headingFont.variable}`;
