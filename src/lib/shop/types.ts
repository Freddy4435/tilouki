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
  mediationUrl?: string | null;
  repIdu?: string | null;
  hostName?: string | null;
  hostAddress?: string | null;
  hostPhone?: string | null;
  primaryColor: string;
  contactEmail: string;
  categories: ShopCategory[];
}
