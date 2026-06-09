import type { CSSProperties } from "react";

import type { ShopSettings } from "./types";

/**
 * Génère les variables CSS inline pour personnaliser le thème boutique.
 * Accepte une couleur en oklch() ou hex (#RRGGBB).
 */
export function buildShopThemeStyle(settings: Pick<ShopSettings, "primaryColor">): CSSProperties {
  return {
    "--shop-primary": settings.primaryColor,
  } as CSSProperties;
}

export function getShopInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "T";
}
