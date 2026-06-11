export type ProductReadinessIssueId = "no-photos" | "no-stock" | "no-weight";

export interface ProductReadinessIssue {
  id: ProductReadinessIssueId;
  message: string;
}

export interface ProductReadinessVariant {
  stockQuantity: number;
  weightGrams: number | null;
  isActive: boolean;
}

export function getProductReadinessIssues(params: {
  imagesCount: number;
  variants: ProductReadinessVariant[];
}): ProductReadinessIssue[] {
  const issues: ProductReadinessIssue[] = [];
  const activeVariants = params.variants.filter((v) => v.isActive);

  if (params.imagesCount === 0) {
    issues.push({
      id: "no-photos",
      message: "Aucune photo — ajoutez au moins une image pour une fiche attractive.",
    });
  }

  if (activeVariants.length === 0) {
    issues.push({
      id: "no-stock",
      message: "Aucune variante active — activez au moins une taille ou un âge.",
    });
  } else {
    const totalStock = activeVariants.reduce((sum, v) => sum + v.stockQuantity, 0);
    if (totalStock === 0) {
      issues.push({
        id: "no-stock",
        message: "Stock à zéro — renseignez le stock pour pouvoir vendre.",
      });
    }
  }

  const missingWeight = activeVariants.some((v) => !v.weightGrams || v.weightGrams <= 0);
  if (missingWeight) {
    issues.push({
      id: "no-weight",
      message:
        "Poids manquant sur une ou plusieurs variantes — nécessaire pour calculer les frais de livraison.",
    });
  }

  return issues;
}

export function isReadyToPublish(issues: ProductReadinessIssue[]): boolean {
  return issues.length === 0;
}
