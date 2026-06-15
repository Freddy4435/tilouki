import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import {
  getLegalComplianceAction,
  getLegalComplianceSummary,
  type LegalComplianceInput,
} from "@/lib/legal/compliance";

interface LegalComplianceAlertProps {
  settings: LegalComplianceInput | null;
}

export function LegalComplianceAlert({ settings }: LegalComplianceAlertProps) {
  const { isComplete, missingRequired } = getLegalComplianceSummary(settings, {
    includeInfrastructure: false,
  });

  if (isComplete) return null;

  const actionLinks = new Map<string, string>();
  for (const item of missingRequired) {
    const action = getLegalComplianceAction(item);
    actionLinks.set(action.href, action.label);
  }

  return (
    <div
      className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 dark:bg-amber-950/20"
      role="alert"
    >
      <p className="flex items-start gap-2 text-sm font-medium text-amber-950 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        Informations légales incomplètes — checkout bloqué en production
      </p>
      <p className="mt-1 text-sm text-amber-900 dark:text-amber-50/90">
        {missingRequired.length} élément{missingRequired.length > 1 ? "s" : ""}{" "}
        obligatoire{missingRequired.length > 1 ? "s" : ""} à compléter avant
        d&apos;ouvrir les ventes. Faites valider les textes finaux par la vendeuse ou un
        professionnel du droit.
      </p>
      <ul className="mt-2 space-y-1 text-sm text-amber-900 dark:text-amber-50/90">
        {missingRequired.slice(0, 8).map((item) => (
          <li key={item.id}>
            <span className="font-medium">{item.label}</span>
            {item.hint ? (
              <span className="block text-xs text-amber-800/90 dark:text-amber-50/80">
                {item.hint}
              </span>
            ) : null}
          </li>
        ))}
        {missingRequired.length > 8 ? (
          <li className="text-xs">… et {missingRequired.length - 8} autre(s)</li>
        ) : null}
      </ul>
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {Array.from(actionLinks.entries()).map(([href, label]) => (
          <Link key={href} href={href} className="text-primary font-medium underline">
            {label} →
          </Link>
        ))}
      </p>
    </div>
  );
}
