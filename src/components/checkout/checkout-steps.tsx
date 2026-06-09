import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Informations" },
  { id: 2, label: "Livraison" },
  { id: 3, label: "Paiement" },
] as const;

interface CheckoutStepsProps {
  currentStep: number;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Étapes de commande" className="mb-8">
      <ol className="flex gap-2 sm:gap-4">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;

          return (
            <li key={step.id} className="flex flex-1 flex-col gap-2">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  isActive || isDone ? "bg-primary" : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium sm:text-sm",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.id}. {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
