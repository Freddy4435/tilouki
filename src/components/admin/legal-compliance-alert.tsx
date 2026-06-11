import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { getLegalComplianceSummary, type LegalComplianceInput } from "@/lib/legal/compliance";

interface LegalComplianceAlertProps {
  settings: LegalComplianceInput | null;
}

export function LegalComplianceAlert({ settings }: LegalComplianceAlertProps) {
  const { isComplete, missingRequired } = getLegalComplianceSummary(settings);

  if (isComplete) return null;

  return (
    <div
      className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 dark:bg-amber-950/20"
      role="alert"
    >
      <p className="flex items-start gap-2 text-sm font-medium text-amber-950 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        Informations légales incomplètes
      </p>
      <p className="mt-1 text-sm text-amber-900 dark:text-amber-50/90">
        {missingRequired.length} champ{missingRequired.length > 1 ? "s" : ""} obligatoire
        {missingRequired.length > 1 ? "s" : ""} manquant{missingRequired.length > 1 ? "s" : ""} dans les
        paramètres boutique. Les pages publiques masquent les champs vides, mais votre boutique ne sera pas
        conforme tant que ces informations ne sont pas renseignées et validées par un professionnel.
      </p>
      <ul className="mt-2 list-inside list-disc text-sm text-amber-900 dark:text-amber-50/90">
        {missingRequired.slice(0, 5).map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
        {missingRequired.length > 5 ? (
          <li>… et {missingRequired.length - 5} autre(s)</li>
        ) : null}
      </ul>
      <Link
        href="/admin/parametres"
        className="text-primary mt-2 inline-block text-sm font-medium underline"
      >
        Compléter les paramètres →
      </Link>
    </div>
  );
}
