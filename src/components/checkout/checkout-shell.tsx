import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { cn } from "@/lib/utils";

interface CheckoutShellProps {
  children: React.ReactNode;
  className?: string;
}

export function CheckoutShell({ children, className }: CheckoutShellProps) {
  return (
    <div className={cn("container-tilouki section-tilouki", className)}>
      <header className="mb-6 space-y-3 rounded-2xl border border-tilouki-blue/10 bg-gradient-to-br from-tilouki-blue-soft/25 via-card to-background p-5 sm:mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Finaliser ma commande
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
            Coordonnées, point relais, paiement sécurisé — colis expédié depuis la France.
          </p>
        </div>
        <ReassuranceStrip variant="compact" className="justify-start" />
      </header>
      {children}
    </div>
  );
}
