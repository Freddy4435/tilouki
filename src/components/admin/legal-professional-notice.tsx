import { Scale } from "lucide-react";

export function LegalProfessionalNotice({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50 ${className ?? ""}`}
      role="note"
    >
      <p className="flex items-start gap-2 font-medium">
        <Scale className="mt-0.5 size-4 shrink-0" />
        Validation professionnelle requise
      </p>
      <p className="mt-1 leading-relaxed">
        Les modèles fournis sont une base structurée pour une boutique française. La
        vendeuse ou un professionnel du droit (avocat, juriste, expert-comptable) doit
        relire et adapter chaque texte avant la mise en ligne définitive.
      </p>
    </div>
  );
}
