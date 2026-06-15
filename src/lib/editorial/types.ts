export interface EditorialBlock {
  title: string;
  hook: string;
  imageUrl: string | null;
  /** Libellé affiché sur la surface de marque quand imageUrl est absent. */
  surfaceLabel?: string;
  href: string;
  active?: boolean;
}
