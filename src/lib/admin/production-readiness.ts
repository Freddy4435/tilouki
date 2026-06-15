import { isDevSeedProductSlug } from "@/lib/catalog/dev-seed";

export type ReadinessDisplayStatus = "ok" | "warning" | "blocking";

export type ReadinessSeverity = "blocking" | "warning";

export interface DeployEnvError {
  id: string;
  message: string;
  fix?: string;
}

export interface ProductionReadinessCheck {
  id: string;
  group: "data" | "environment" | "deploy";
  label: string;
  status: ReadinessDisplayStatus;
  severity: ReadinessSeverity;
  detail?: string;
  actionHref?: string;
  actionLabel?: string;
}

export interface ProductionReadinessInput {
  legalReady: boolean;
  legalMissingLabels: string[];
  activeCategoryCount: number;
  activeRealProductCount: number;
  activeDevSeedProductCount: number;
  legalPagesCheckoutReady: boolean;
  legalPagesBlockedLabels: string[];
  mondialRelayActiveRateCount: number;
  deployEnvValid: boolean;
  deployEnvErrors: DeployEnvError[];
  deployEnvWarnings: DeployEnvError[];
  analyticsEnabled: boolean;
  pendingReviewCount: number;
}

export interface ProductionReadinessSummary {
  checks: ProductionReadinessCheck[];
  /** Données boutique + catalogue + pages légales publiables. */
  readyToSell: boolean;
  /** Aligné sur `npm run verify:deploy:prod` (variables + dépôt). */
  deployEnvValid: boolean;
  /** Prêt à encaisser : boutique + configuration production complètes. */
  readyToCollect: boolean;
  blockingCount: number;
  warningCount: number;
}

function displayStatus(
  met: boolean,
  severity: ReadinessSeverity,
): ReadinessDisplayStatus {
  if (met) return "ok";
  return severity === "blocking" ? "blocking" : "warning";
}

export function buildProductionReadinessChecks(
  input: ProductionReadinessInput,
): ProductionReadinessCheck[] {
  const checks: ProductionReadinessCheck[] = [
    {
      id: "legal-identity",
      group: "data",
      label: "Identité légale complète (paramètres boutique)",
      severity: "blocking",
      status: displayStatus(input.legalReady, "blocking"),
      detail: input.legalReady
        ? "E-mail, téléphone, médiation, hébergeur et retours renseignés."
        : input.legalMissingLabels.length > 0
          ? `Manquant : ${input.legalMissingLabels.slice(0, 4).join(", ")}${input.legalMissingLabels.length > 4 ? "…" : ""}`
          : "Paramètres boutique incomplets.",
      actionHref: "/admin/parametres",
      actionLabel: "Paramètres",
    },
    {
      id: "active-categories",
      group: "data",
      label: "Au moins une catégorie active",
      severity: "blocking",
      status: displayStatus(input.activeCategoryCount > 0, "blocking"),
      detail:
        input.activeCategoryCount > 0
          ? `${input.activeCategoryCount} catégorie(s) active(s).`
          : "Créez ou activez une catégorie de navigation.",
      actionHref: "/admin/categories",
      actionLabel: "Catégories",
    },
    {
      id: "active-real-products",
      group: "data",
      label: "Au moins un produit réel actif",
      severity: "blocking",
      status: displayStatus(input.activeRealProductCount > 0, "blocking"),
      detail:
        input.activeRealProductCount > 0
          ? `${input.activeRealProductCount} produit(s) hors démo actif(s).`
          : "Importez ou activez des produits vendables (hors démo DEV-).",
      actionHref: "/admin/produits",
      actionLabel: "Produits",
    },
    {
      id: "no-active-demo-products",
      group: "data",
      label: "Aucun produit de démonstration actif",
      severity: "blocking",
      status: displayStatus(input.activeDevSeedProductCount === 0, "blocking"),
      detail:
        input.activeDevSeedProductCount === 0
          ? "Aucun slug démo actif."
          : `${input.activeDevSeedProductCount} produit(s) démo encore actif(s). Lancez npm run catalog:go-live -- --apply.`,
      actionHref: "/admin/produits",
      actionLabel: "Produits",
    },
    {
      id: "legal-pages",
      group: "data",
      label: "Pages légales publiables (sans placeholder)",
      severity: "blocking",
      status: displayStatus(input.legalPagesCheckoutReady, "blocking"),
      detail: input.legalPagesCheckoutReady
        ? "Les 6 pages légales sont publiables — le checkout production peut s'ouvrir."
        : input.legalPagesBlockedLabels.length > 0
          ? `À compléter : ${input.legalPagesBlockedLabels.join(", ")}`
          : "Textes provisoires ou variables non résolues détectés.",
      actionHref: "/admin/pages-legales",
      actionLabel: "Pages légales",
    },
    {
      id: "mondial-relay-rates",
      group: "data",
      label: "Barème Mondial Relay actif",
      severity: "blocking",
      status: displayStatus(input.mondialRelayActiveRateCount > 0, "blocking"),
      detail:
        input.mondialRelayActiveRateCount > 0
          ? `${input.mondialRelayActiveRateCount} tranche(s) active(s).`
          : "Ajoutez au moins une tranche de poids active.",
      actionHref: "/admin/livraison",
      actionLabel: "Livraison",
    },
    ...input.deployEnvErrors.map((error) => ({
      id: `deploy-${error.id}`,
      group: "deploy" as const,
      label: error.message,
      severity: "blocking" as const,
      status: "blocking" as const,
      detail: error.fix ?? "Voir docs/variables-production.md",
      actionHref: "/admin/preparation",
      actionLabel: "Documentation",
    })),
    ...input.deployEnvWarnings.map((warning) => ({
      id: `deploy-warn-${warning.id}`,
      group: "deploy" as const,
      label: warning.message,
      severity: "warning" as const,
      status: "warning" as const,
      detail: warning.fix,
    })),
    {
      id: "verify-deploy-prod",
      group: "deploy",
      label: "Garde-fou npm run verify:deploy:prod",
      severity: "blocking",
      status: displayStatus(input.deployEnvValid, "blocking"),
      detail: input.deployEnvValid
        ? "Variables production et prérequis dépôt validés."
        : `${input.deployEnvErrors.length} variable(s) ou prérequis manquant(s) — exécutez npm run verify:deploy:prod en local pour la liste complète.`,
    },
    {
      id: "reviews-moderation",
      group: "data",
      label: "Avis clients modérés",
      severity: "warning",
      status: input.pendingReviewCount === 0 ? "ok" : "warning",
      detail:
        input.pendingReviewCount === 0
          ? "Aucun avis en attente de modération."
          : `${input.pendingReviewCount} avis en attente de publication.`,
      actionHref: "/admin/avis?status=pending",
      actionLabel: "Modérer les avis",
    },
    {
      id: "analytics",
      group: "data",
      label: "Mesure d'audience",
      severity: "warning",
      status: input.analyticsEnabled ? "warning" : "ok",
      detail: input.analyticsEnabled
        ? "Activée — vérifiez le bandeau cookies et le consentement."
        : "Désactivée (recommandé tant que la conformité n'est pas validée).",
      actionHref: "/admin/parametres",
      actionLabel: "Paramètres",
    },
  ];

  return checks;
}

export function summarizeProductionReadiness(
  checks: ProductionReadinessCheck[],
  deployEnvValid: boolean,
): ProductionReadinessSummary {
  const blockingCount = checks.filter((c) => c.status === "blocking").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;
  const dataBlocking = checks.some(
    (check) => check.group === "data" && check.status === "blocking",
  );
  const deployBlocking = checks.some(
    (check) => check.group === "deploy" && check.status === "blocking",
  );

  return {
    checks,
    readyToSell: !dataBlocking,
    deployEnvValid,
    readyToCollect: !dataBlocking && !deployBlocking && deployEnvValid,
    blockingCount,
    warningCount,
  };
}

export function buildProductionReadinessSummary(
  input: ProductionReadinessInput,
): ProductionReadinessSummary {
  const checks = buildProductionReadinessChecks(input);
  return summarizeProductionReadiness(checks, input.deployEnvValid);
}

/** Compte les produits actifs hors slugs démo seed. */
export function countActiveRealProducts(
  products: Array<{ slug: string; status: string }>,
): number {
  return products.filter(
    (product) => product.status === "active" && !isDevSeedProductSlug(product.slug),
  ).length;
}
