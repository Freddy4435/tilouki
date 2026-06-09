import { cn } from "@/lib/utils";

interface CheckoutShellProps {
  children: React.ReactNode;
  className?: string;
}

export function CheckoutShell({ children, className }: CheckoutShellProps) {
  return (
    <div className={cn("container-tilouki section-tilouki", className)}>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Commande</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Renseignez vos informations et choisissez votre point relais.
        </p>
      </header>
      {children}
    </div>
  );
}
