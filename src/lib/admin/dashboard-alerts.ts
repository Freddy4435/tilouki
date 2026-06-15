import {
  getLegalComplianceSummary,
  type LegalComplianceInput,
} from "@/lib/legal/compliance";

export type AdminDashboardAlertSeverity = "critical" | "warning";

export type AdminDashboardAlertActionId = "deactivate-demo-products";

export interface AdminDashboardAlertAction {
  label: string;
  action: AdminDashboardAlertActionId;
}

export interface AdminDashboardAlert {
  id: string;
  severity: AdminDashboardAlertSeverity;
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
  actions?: AdminDashboardAlertAction[];
}

export interface AdminDashboardAlertContext {
  legalSettings: LegalComplianceInput | null;
  activeProductCount: number;
  productsWithoutPhotoCount: number;
  productsWithoutStockCount: number;
  productsWithoutWeightCount: number;
  storageConfigured: boolean;
  stripeConfigured: boolean;
  adminEmailConfigured: boolean;
  transactionEmailConfigured: boolean;
  mondialRelayConfigured: boolean;
  chronopostConfigured: boolean;
  devMockShipping: boolean;
  activeDevSeedProductCount: number;
}

export interface AdminDashboardPriority {
  id: string;
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
  emphasis?: boolean;
}

export function buildAdminConfigurationAlerts(
  ctx: AdminDashboardAlertContext,
): AdminDashboardAlert[] {
  const alerts: AdminDashboardAlert[] = [];
  const legal = getLegalComplianceSummary(ctx.legalSettings, {
    includeInfrastructure: false,
  });

  if (!ctx.stripeConfigured) {
    alerts.push({
      id: "stripe",
      severity: "critical",
      title: "Stripe non configuré",
      description:
        "Les paiements en ligne ne fonctionneront pas tant que les clés Stripe (secrète et publique) ne sont pas renseignées.",
      href: "/admin/parametres",
      hrefLabel: "Voir les paramètres",
    });
  }

  if (!ctx.storageConfigured) {
    alerts.push({
      id: "storage",
      severity: "critical",
      title: "Supabase Storage non configuré",
      description:
        "Le bucket « product-images » est absent ou inaccessible. Vous ne pourrez pas ajouter de photos produits.",
      href: "/admin/produits/nouveau",
      hrefLabel: "Configurer les produits",
    });
  }

  if (!ctx.transactionEmailConfigured) {
    alerts.push({
      id: "email-provider",
      severity: "critical",
      title: "E-mails transactionnels non configurés",
      description:
        "Aucun fournisseur e-mail actif (Resend ou SMTP). Les clients ne recevront pas de confirmation ni de suivi d'expédition.",
      href: "/admin/parametres",
      hrefLabel: "Voir les paramètres",
    });
  }

  if (!ctx.adminEmailConfigured) {
    alerts.push({
      id: "admin-email",
      severity: "warning",
      title: "E-mail admin manquant",
      description:
        "Définissez ADMIN_EMAIL pour recevoir les notifications de nouvelles commandes.",
      href: "/admin/parametres",
      hrefLabel: "Compléter les paramètres",
    });
  }

  if (!legal.isComplete) {
    const preview = legal.missingRequired
      .slice(0, 3)
      .map((item) => item.label)
      .join(", ");
    alerts.push({
      id: "legal",
      severity: "critical",
      title: "Socle légal incomplet",
      description: `${legal.missingRequired.length} élément${legal.missingRequired.length > 1 ? "s" : ""} obligatoire${legal.missingRequired.length > 1 ? "s" : ""} manquant${legal.missingRequired.length > 1 ? "s" : ""}${preview ? ` : ${preview}${legal.missingRequired.length > 3 ? "…" : ""}` : ""}. Le checkout production reste bloqué.`,
      href: "/admin/pages-legales",
      hrefLabel: "Voir la checklist légale",
    });
  }

  if (!ctx.mondialRelayConfigured) {
    alerts.push({
      id: "mondial-relay",
      severity: ctx.devMockShipping ? "warning" : "critical",
      title: "Mondial Relay non configuré",
      description: ctx.devMockShipping
        ? "Mode développement actif (points relais fictifs). Configurez MONDIAL_RELAY_BRAND_ID et MONDIAL_RELAY_PRIVATE_KEY avant la mise en production."
        : "La livraison en point relais est indisponible. Ajoutez les identifiants Mondial Relay.",
      href: "/admin/parametres",
      hrefLabel: "Voir les paramètres",
    });
  }

  if (!ctx.chronopostConfigured) {
    alerts.push({
      id: "chronopost",
      severity: "warning",
      title: "Chronopost relais non configuré",
      description: ctx.mondialRelayConfigured
        ? "Seul Mondial Relay est proposé aux clients. Ajoutez CHRONOPOST_ACCOUNT_NUMBER et CHRONOPOST_PASSWORD pour activer Chronopost relais."
        : "Chronopost relais n'est pas disponible. Configurez les identifiants Chronopost ou activez Mondial Relay.",
      href: "/admin/livraison",
      hrefLabel: "Voir la livraison",
    });
  }

  if (ctx.activeDevSeedProductCount > 0) {
    const n = ctx.activeDevSeedProductCount;
    alerts.push({
      id: "demo-products",
      severity: "critical",
      title: "Produits de démonstration détectés",
      description: `${n} produit${n > 1 ? "s" : ""} de démo encore actif${n > 1 ? "s" : ""} sur le site. Ces articles ne doivent jamais être vendus en production.`,
      href: "/admin/produits?demo=1",
      hrefLabel: "Voir les produits démo",
      actions: [
        {
          label: "Désactiver tous les produits démo",
          action: "deactivate-demo-products",
        },
      ],
    });
  }

  if (ctx.activeProductCount === 0) {
    alerts.push({
      id: "no-active-products",
      severity: "critical",
      title: "Aucun produit actif",
      description:
        "Votre catalogue en ligne est vide. Ajoutez et publiez au moins un produit.",
      href: "/admin/produits/nouveau",
      hrefLabel: "Ajouter un produit",
    });
  }

  if (ctx.productsWithoutPhotoCount > 0) {
    alerts.push({
      id: "products-no-photo",
      severity: "warning",
      title: "Produits sans photo",
      description: `${ctx.productsWithoutPhotoCount} produit${ctx.productsWithoutPhotoCount > 1 ? "s" : ""} sans image — les fiches seront peu attractives.`,
      href: "/admin/produits",
      hrefLabel: "Voir les produits",
    });
  }

  if (ctx.productsWithoutStockCount > 0) {
    alerts.push({
      id: "products-no-stock",
      severity: "warning",
      title: "Produits sans stock",
      description: `${ctx.productsWithoutStockCount} produit${ctx.productsWithoutStockCount > 1 ? "s" : ""} actif${ctx.productsWithoutStockCount > 1 ? "s" : ""} avec stock à zéro — impossible à commander.`,
      href: "/admin/stock",
      hrefLabel: "Gérer le stock",
    });
  }

  if (ctx.productsWithoutWeightCount > 0) {
    alerts.push({
      id: "products-no-weight",
      severity: "warning",
      title: "Produits sans poids",
      description: `${ctx.productsWithoutWeightCount} produit${ctx.productsWithoutWeightCount > 1 ? "s" : ""} avec variante(s) sans poids — les frais de livraison seront incorrects.`,
      href: "/admin/produits",
      hrefLabel: "Compléter les fiches",
    });
  }

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1 };
    return order[a.severity] - order[b.severity];
  });
}

export function buildAdminDashboardPriorities(input: {
  ordersToPrepare: number;
  paidNotShippedCount: number;
  lowStockCount: number;
  alerts: AdminDashboardAlert[];
  activeProductCount: number;
}): AdminDashboardPriority[] {
  const priorities: AdminDashboardPriority[] = [];

  if (input.ordersToPrepare > 0) {
    priorities.push({
      id: "prepare-orders",
      title: `${input.ordersToPrepare} commande${input.ordersToPrepare > 1 ? "s" : ""} à préparer`,
      description: "Commandes payées en attente de préparation.",
      href: "/admin/commandes?status=paid",
      hrefLabel: "Voir les commandes à préparer",
      emphasis: true,
    });
  }

  if (input.paidNotShippedCount > input.ordersToPrepare) {
    priorities.push({
      id: "ship-orders",
      title: `${input.paidNotShippedCount} commande${input.paidNotShippedCount > 1 ? "s" : ""} non expédiée${input.paidNotShippedCount > 1 ? "s" : ""}`,
      description: "Commandes payées encore à préparer ou à expédier.",
      href: "/admin/commandes?status=preparing",
      hrefLabel: "Voir en préparation",
      emphasis: true,
    });
  }

  const criticalAlerts = input.alerts.filter((a) => a.severity === "critical");
  if (criticalAlerts.length > 0) {
    const first = criticalAlerts[0]!;
    priorities.push({
      id: "fix-config",
      title: "Configuration à finaliser",
      description: first.title,
      href: first.href,
      hrefLabel: first.hrefLabel,
      emphasis: true,
    });
  }

  if (input.activeProductCount === 0) {
    priorities.push({
      id: "add-product",
      title: "Lancer votre catalogue",
      description: "Créez votre premier produit ou importez un fichier CSV.",
      href: "/admin/produits/nouveau",
      hrefLabel: "Ajouter un produit",
    });
  }

  if (input.lowStockCount > 0) {
    priorities.push({
      id: "low-stock",
      title: `${input.lowStockCount} alerte${input.lowStockCount > 1 ? "s" : ""} stock faible`,
      description: "Variantes à 3 unités ou moins.",
      href: "/admin/stock",
      hrefLabel: "Voir le stock",
    });
  }

  return priorities.slice(0, 4);
}
