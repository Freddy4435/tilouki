export interface CatalogSellReadinessInput {
  activeDevSeedProductCount: number;
  activeRealProductCount: number;
  activeProductsWithReadinessIssues: number;
  activeProductsWithLegacyDemoImages: number;
  draftProductsReadyToPublish: number;
  importPageHref?: string;
}

export interface CatalogSellReadinessItem {
  id: string;
  label: string;
  required: boolean;
  filled: boolean;
  hint?: string;
  href?: string;
  hrefLabel?: string;
}

export function buildCatalogSellReadinessItems(
  input: CatalogSellReadinessInput,
): CatalogSellReadinessItem[] {
  return [
    {
      id: "no-demo-active",
      label: "Aucun produit de démonstration actif",
      required: true,
      filled: input.activeDevSeedProductCount === 0,
      hint:
        input.activeDevSeedProductCount > 0
          ? `${input.activeDevSeedProductCount} produit(s) démo encore en ligne — désactivez-les avant vente.`
          : undefined,
      href: "/admin/produits?demo=1",
      hrefLabel: "Voir les démos",
    },
    {
      id: "real-products",
      label: "Au moins un produit réel publié",
      required: true,
      filled: input.activeRealProductCount > 0,
      hint: "Importez votre catalogue ou publiez une fiche complète.",
      href: input.importPageHref ?? "/admin/import",
      hrefLabel: "Importer",
    },
    {
      id: "no-legacy-demo-images",
      label: "Aucun visuel SVG démo (/products/*.svg ou /demo-products/*)",
      required: true,
      filled: input.activeProductsWithLegacyDemoImages === 0,
      hint:
        input.activeProductsWithLegacyDemoImages > 0
          ? `${input.activeProductsWithLegacyDemoImages} fiche(s) utilisent encore un SVG catalogue ou démo — uploadez des photos réelles.`
          : undefined,
      href: "/admin/produits?status=active",
      hrefLabel: "Produits actifs",
    },
    {
      id: "active-complete",
      label:
        "Produits publiés complets (photo commerciale, prix, taille, stock, poids)",
      required: true,
      filled: input.activeProductsWithReadinessIssues === 0,
      hint:
        input.activeProductsWithReadinessIssues > 0
          ? `${input.activeProductsWithReadinessIssues} fiche(s) active(s) incomplète(s) — corrigez avant vente.`
          : undefined,
      href: "/admin/produits?status=active",
      hrefLabel: "Produits actifs",
    },
    {
      id: "draft-ready",
      label: "Brouillons prêts à publier",
      required: false,
      filled: input.draftProductsReadyToPublish > 0,
      hint:
        input.draftProductsReadyToPublish > 0
          ? `${input.draftProductsReadyToPublish} brouillon(s) peuvent être publiés.`
          : "Complétez photos, variantes et catégories sur vos brouillons.",
      href: "/admin/produits?status=draft",
      hrefLabel: "Brouillons",
    },
  ];
}

export function getCatalogSellReadinessSummary(input: CatalogSellReadinessInput) {
  const items = buildCatalogSellReadinessItems(input);
  const missingRequired = items.filter((item) => item.required && !item.filled);

  return {
    items,
    missingRequired,
    isReadyToSell: missingRequired.length === 0,
    requiredCount: items.filter((item) => item.required).length,
    filledRequiredCount: items.filter((item) => item.required && item.filled).length,
  };
}
