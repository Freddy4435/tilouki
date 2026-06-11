import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Informations", short: "Vous" },
  { id: 2, label: "Livraison", short: "Relais" },
  { id: 3, label: "Paiement", short: "Payer" },
] as const;

interface CheckoutStepsProps {
  currentStep: number;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Étapes de commande" className="mb-8">
      <div className="relative mb-5">
        <div className="bg-muted h-1.5 w-full rounded-full" />
        <div
          className="bg-primary absolute top-0 left-0 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
          aria-hidden
        />
      </div>
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;

          return (
            <li key={step.id} className="flex flex-col items-center gap-1.5 text-center">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold sm:size-9 sm:text-sm",
                  isDone && "bg-primary text-primary-foreground",
                  isActive && !isDone && "bg-primary text-primary-foreground ring-primary/20 ring-4",
                  !isActive && !isDone && "bg-muted text-muted-foreground",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? <Check className="size-4" aria-hidden /> : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-semibold sm:block sm:text-sm",
                  isActive || isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  "text-xs font-medium sm:hidden",
                  isActive || isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.short}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
