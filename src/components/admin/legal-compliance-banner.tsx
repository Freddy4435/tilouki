import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import {
  getLegalComplianceAction,
  getLegalComplianceSummary,
  type LegalComplianceInput,
} from "@/lib/legal/compliance";

interface LegalComplianceBannerProps {
  settings: LegalComplianceInput | null;
}

export function LegalComplianceBanner({ settings }: LegalComplianceBannerProps) {
  const { isComplete, missingRequired } = getLegalComplianceSummary(settings, {
    includeInfrastructure: false,
  });

  if (isComplete) return null;

  const actionLinks = new Map<string, string>();
  for (const item of missingRequired) {
    const action = getLegalComplianceAction(item);
    actionLinks.set(action.href, action.label);
  }

  const preview = missingRequired.slice(0, 4);

  return (
    <div
      className="border-b border-red-500/30 bg-red-600 px-4 py-3 text-white md:px-8"
      role="alert"
    >
      <p className="flex items-start gap-2 text-sm font-semibold">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        Mise en vente bloquée — socle légal incomplet
      </p>
      <p className="mt-1 text-sm text-red-50">
        {missingRequired.length} élément{missingRequired.length > 1 ? "s" : ""}{" "}
        obligatoire{missingRequired.length > 1 ? "s" : ""} manquant
        {missingRequired.length > 1 ? "s" : ""}. Les commandes en ligne restent
        désactivées en production.
      </p>
      <ul className="mt-2 list-inside list-disc text-sm text-red-50">
        {preview.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
        {missingRequired.length > preview.length ? (
          <li>… et {missingRequired.length - preview.length} autre(s)</li>
        ) : null}
      </ul>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {Array.from(actionLinks.entries()).map(([href, label]) => (
          <Link key={href} href={href} className="font-medium underline">
            {label} →
          </Link>
        ))}
      </p>
    </div>
  );
}
