import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

interface ImageUploadFeedbackProps {
  error?: string | null;
  warning?: string | null;
  className?: string;
}

/** Messages d'upload lisibles sur mobile (retour à la ligne, zone tactile claire). */
export function ImageUploadFeedback({
  error,
  warning,
  className,
}: ImageUploadFeedbackProps) {
  if (!error && !warning) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {error ? (
        <p
          className="text-destructive border-destructive/30 bg-destructive/5 rounded-lg border px-3 py-2 text-sm leading-relaxed break-words"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {warning ? (
        <p
          className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-sm leading-relaxed break-words text-amber-950 dark:bg-amber-950/20 dark:text-amber-50"
          role="status"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{warning}</span>
        </p>
      ) : null}
    </div>
  );
}
