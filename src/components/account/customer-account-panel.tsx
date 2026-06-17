"use client";

import { LogOut } from "lucide-react";

import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { customerLogoutAction } from "@/server/actions/account/auth";

interface CustomerAccountPanelProps {
  email: string | null;
}

export function CustomerAccountPanel({ email }: CustomerAccountPanelProps) {
  if (email) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          Connecté en tant que{" "}
          <span className="font-medium text-foreground">{email}</span>. Vos favoris
          sont synchronisés sur tous vos appareils.
        </p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/favoris" size="lg">
            Voir mes favoris
          </ButtonLink>
          <form action={customerLogoutAction}>
            <Button type="submit" variant="outline" size="lg">
              <LogOut className="size-4" />
              Se déconnecter
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <CustomerLoginForm />;
}
