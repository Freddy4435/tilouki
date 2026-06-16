/**
 * Attributs `sizes` pour next/image — alignés sur container-tilouki (~1280px)
 * et les grilles catalogue / home. Évite de télécharger des srcSet trop larges.
 */
export const IMAGE_SIZES = {
  /** LCP hero pleine largeur (accueil, rituel). */
  hero: "(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px",
  /** Photo principale fiche produit (colonne galerie desktop ~42 %). */
  productMain: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px",
  /** Vignette galerie produit (colonne verticale). */
  productThumbColumn: "88px",
  /** Vignette galerie produit (bandeau horizontal mobile). */
  productThumbRow: "72px",
  /** Carte produit catalogue / catégorie. */
  productCard: "(max-width: 640px) 44vw, (max-width: 1024px) 33vw, 260px",
  /** Carte produit rail home (carrousel). */
  productCardRail: "(max-width: 640px) 42vw, 12rem",
  /** Carte rituel / éditorial compact. */
  editorialCard: "(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 320px",
  /** Rayon home featured (demi-grille). */
  categoryFeatured: "(max-width: 640px) 100vw, 640px",
  /** Tuile rayon home standard. */
  categoryTile: "(max-width: 640px) 45vw, 280px",
  /** Logo header. */
  logo: "36px",
  /** Panier ligne article. */
  cartLine: "96px",
  cartLineCompact: "64px",
} as const;
