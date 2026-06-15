import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckoutErrorAlertProps {
  message: string;
  className?: string;
}

export function CheckoutErrorAlert({ message, className }: CheckoutErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "border-destructive/30 bg-destructive/5 text-destructive flex gap-2 rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-relaxed",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
