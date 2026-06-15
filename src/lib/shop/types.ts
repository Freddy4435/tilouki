import type { EditorialBlock } from "@/lib/editorial/types";
import type { StorefrontNavigation } from "@/lib/navigation/types";
import type { ShopSocialLinksInput } from "@/lib/social/validation";
import type { ShopAnnouncement } from "@/lib/announcements/types";

export interface ShopCategory {
  slug: string;
  label: string;
  href: string;
  description?: string;
}

export interface ShopSettings {
  id?: string;
  name: string;
  tagline: string;
  description: string;
  legalName?: string | null;
  legalStatus?: string | null;
  siret?: string | null;
  address?: string | null;
  phone?: string | null;
  vatEnabled?: boolean;
  vatRate?: number;
  vatNotice?: string | null;
  currency?: string;
  mediationName?: string | null;
  mediationUrl?: string | null;
  repIdu?: string | null;
  hostName?: string | null;
  hostAddress?: string | null;
  hostPhone?: string | null;
  hostEmail?: string | null;
  /** Politique retours / rétractation (CGV, livraison-retours). */
  returnPolicy?: string | null;
  /** Politique échange de taille. */
  exchangePolicy?: string | null;
  /** Active la section analytics dans la politique cookies (consentement requis). */
  analyticsEnabled?: boolean;
  primaryColor: string;
  contactEmail: string;
  /** E-mail renseigné en admin (pas le fallback par défaut). */
  contactEmailConfigured?: boolean;
  /** URL publique de la photo hero (page d'accueil). */
  heroImageUrl?: string | null;
  /** Barre d'annonces en tête du site. */
  announcementsEnabled?: boolean;
  announcements?: ShopAnnouncement[];
  /** Liens réseaux sociaux (footer). */
  socialLinks?: ShopSocialLinksInput;
  /** Blocs éditoriaux page d'accueil. */
  editorialBlocks?: EditorialBlock[];
  /** Frais de port minimum (centimes) — barème actif le moins cher. */
  minShippingCents: number;
  categories: ShopCategory[];
  navigation: StorefrontNavigation;
}

export type { ShopAnnouncement };
