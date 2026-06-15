import type { ShopAnnouncement } from "@/lib/announcements/types";

/** Modèles proposés en admin — inactifs tant que la barre n'est pas activée. */
export const DEFAULT_SHOP_ANNOUNCEMENTS: ShopAnnouncement[] = [
  { text: "Livraison en point relais Mondial Relay", active: false },
  { text: "Retours sous 14 jours", active: false },
  { text: "Paiement 100% sécurisé", active: false },
];

export const ANNOUNCEMENT_BAR_HEIGHT_REM = 2.25;
export const ANNOUNCEMENT_ROTATION_MS = 5_000;
