import { CheckCircle2, Circle, Info } from "lucide-react";
import Link from "next/link";

import {
  buildLegalComplianceItems,
  getLegalComplianceSummary,
  type LegalComplianceInput,
} from "@/lib/legal/compliance";
import { cn } from "@/lib/utils";

const GROUP_LABELS = {
  identite: "Identité du vendeur",
  fiscalite: "TVA",
  hebergement: "Hébergement",
  mediation: "Médiation de la consommation",
  retours: "Livraison & retours",
  rep: "REP textile",
} as const;

interface LegalComplianceChecklistProps {
  settings: LegalComplianceInput | null;
  className?: string;
}

export function LegalComplianceChecklist({ settings, className }: LegalComplianceChecklistProps) {
  const summary = getLegalComplianceSummary(settings);
  const items = buildLegalComplianceItems(settings);
  const groups = ["identite", "fiscalite", "hebergement", "mediation", "retours", "rep"] as const;

  return (
    <div className={cn("rounded-xl border p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Checklist légale</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Base indicative — faites valider vos textes par un professionnel du droit.
          </p>
        </div>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{summary.filledRequiredCount}</span>
          <span className="text-muted-foreground"> / {summary.requiredCount} obligatoires</span>
        </p>
      </div>

      {summary.isComplete ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          Toutes les informations obligatoires sont renseignées.
        </p>
      ) : (
        <p className="text-muted-foreground mt-3 flex items-start gap-2 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" />
          Complétez les champs manquants dans{" "}
          <Link href="/admin/parametres" className="text-primary underline">
            Paramètres
          </Link>{" "}
          pour personnaliser automatiquement les pages légales.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {groups.map((group) => {
          const groupItems = items.filter((i) => i.group === group);
          return (
            <div key={group}>
              <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {GROUP_LABELS[group]}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {groupItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    {item.filled ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          item.required ? "text-amber-600" : "text-muted-foreground",
                        )}
                      />
                    )}
                    <span>
                      {item.label}
                      {item.required ? (
                        <span className="text-muted-foreground"> (obligatoire)</span>
                      ) : (
                        <span className="text-muted-foreground"> (recommandé)</span>
                      )}
                      {!item.filled && item.hint ? (
                        <span className="text-muted-foreground block text-xs">{item.hint}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
