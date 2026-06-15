import { CheckCircle2, Circle, Info, Scale } from "lucide-react";
import Link from "next/link";

import {
  buildLegalComplianceItems,
  getLegalComplianceAction,
  getLegalComplianceSummary,
  type LegalComplianceGroup,
  type LegalComplianceInput,
  type LegalComplianceTier,
} from "@/lib/legal/compliance";
import { cn } from "@/lib/utils";

const GROUP_LABELS = {
  identite: "Identité du vendeur",
  fiscalite: "TVA",
  hebergement: "Hébergement",
  mediation: "Médiation de la consommation",
  retours: "Retours, rétractation et remboursements",
  livraison: "Frais et délais de livraison",
  rep: "REP textile",
  pages: "Pages légales publiques",
  infrastructure: "Infrastructure production",
  juridique: "Relecture juridique",
} as const;

const TIER_CONFIG: Record<
  LegalComplianceTier,
  { title: string; description: string; icon: typeof Circle }
> = {
  required: {
    title: "Obligatoire avant vente",
    description:
      "Ces éléments doivent être renseignés pour débloquer le checkout et publier les pages légales.",
    icon: Circle,
  },
  recommended: {
    title: "Recommandé",
    description:
      "Fortement conseillé pour une boutique vêtements enfants, sans bloquer la mise en ligne.",
    icon: Circle,
  },
  legalReview: {
    title: "À valider juridiquement",
    description:
      "Passages type ou sujets sensibles — faites relire par la vendeuse ou un professionnel du droit.",
    icon: Scale,
  },
};

interface LegalComplianceChecklistProps {
  settings: LegalComplianceInput | null;
  className?: string;
  /** Masquer Upstash / Mondial Relay (variables d'environnement, pas le formulaire). */
  shopFieldsOnly?: boolean;
}

function tierLabel(tier: LegalComplianceTier): string {
  if (tier === "required") return "obligatoire";
  if (tier === "recommended") return "recommandé";
  return "à valider";
}

export function LegalComplianceChecklist({
  settings,
  className,
  shopFieldsOnly = false,
}: LegalComplianceChecklistProps) {
  const complianceOptions = shopFieldsOnly
    ? { includeInfrastructure: false }
    : undefined;
  const summary = getLegalComplianceSummary(settings, complianceOptions);
  const items = buildLegalComplianceItems(settings, complianceOptions);

  const groups: LegalComplianceGroup[] = shopFieldsOnly
    ? [
        "identite",
        "fiscalite",
        "hebergement",
        "mediation",
        "retours",
        "livraison",
        "rep",
        "pages",
        "juridique",
      ]
    : [
        "identite",
        "fiscalite",
        "hebergement",
        "mediation",
        "retours",
        "livraison",
        "rep",
        "pages",
        "juridique",
        "infrastructure",
      ];

  const missingLinks = new Map<string, string>();
  for (const item of summary.missingRequired) {
    const action = getLegalComplianceAction(item);
    missingLinks.set(action.href, action.label);
  }

  const tiers: LegalComplianceTier[] = ["required", "recommended", "legalReview"];

  return (
    <div className={cn("rounded-xl border p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Checklist légale</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Base indicative alignée Service Public et CNIL — ne remplace pas un conseil
            juridique.
          </p>
        </div>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{summary.filledRequiredCount}</span>
          <span className="text-muted-foreground">
            {" "}
            / {summary.requiredCount} obligatoires
          </span>
        </p>
      </div>

      {summary.isComplete ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          Toutes les informations obligatoires avant vente sont renseignées.
        </p>
      ) : (
        <div className="text-muted-foreground mt-3 space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0" />
            En production, le checkout est bloqué tant que les éléments obligatoires ne
            sont pas complétés. Les pages publiques ne doivent afficher aucun texte
            provisoire.
          </p>
          {missingLinks.size > 0 ? (
            <p className="flex flex-wrap gap-x-3 gap-y-1">
              {Array.from(missingLinks.entries()).map(([href, label]) => (
                <Link key={href} href={href} className="text-primary underline">
                  {label} →
                </Link>
              ))}
            </p>
          ) : null}
        </div>
      )}

      {summary.pendingLegalReview.length > 0 ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Scale className="mt-0.5 size-4 shrink-0" />
          {summary.pendingLegalReview.length} point(s) à faire valider juridiquement
          avant publication définitive des textes.
        </p>
      ) : null}

      <div className="mt-4 space-y-6">
        {tiers.map((tier) => {
          const tierItems = items.filter((i) => i.tier === tier);
          if (tierItems.length === 0) return null;

          const config = TIER_CONFIG[tier];
          const pendingCount = tierItems.filter((i) => !i.filled).length;

          return (
            <section key={tier}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold">{config.title}</h3>
                <p className="text-muted-foreground text-xs">{config.description}</p>
                {pendingCount > 0 ? (
                  <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                    {tierItems.length - pendingCount} / {tierItems.length} traité(s)
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                {groups.map((group) => {
                  const groupItems = tierItems.filter((i) => i.group === group);
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={`${tier}-${group}`}>
                      <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        {GROUP_LABELS[group]}
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {groupItems.map((item) => {
                          const action = getLegalComplianceAction(item);
                          return (
                            <li
                              key={item.id}
                              className="flex items-start gap-2 text-sm"
                            >
                              {item.filled ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                              ) : (
                                <config.icon
                                  className={cn(
                                    "mt-0.5 size-4 shrink-0",
                                    tier === "required"
                                      ? "text-amber-600"
                                      : tier === "legalReview"
                                        ? "text-amber-700 dark:text-amber-400"
                                        : "text-muted-foreground",
                                  )}
                                />
                              )}
                              <span>
                                {item.label}
                                <span className="text-muted-foreground">
                                  {" "}
                                  ({tierLabel(item.tier)})
                                </span>
                                {!item.filled && item.hint ? (
                                  <span className="text-muted-foreground block text-xs">
                                    {item.hint}
                                  </span>
                                ) : null}
                                {!item.filled && tier === "required" ? (
                                  <Link
                                    href={action.href}
                                    className="text-primary mt-0.5 inline-block text-xs underline"
                                  >
                                    Compléter dans {action.label.toLowerCase()} →
                                  </Link>
                                ) : null}
                                {!item.filled && tier === "legalReview" ? (
                                  <Link
                                    href={action.href}
                                    className="text-primary mt-0.5 inline-block text-xs underline"
                                  >
                                    Relire dans {action.label.toLowerCase()} →
                                  </Link>
                                ) : null}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
