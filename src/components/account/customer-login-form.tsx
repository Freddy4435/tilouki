"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestCustomerMagicLinkAction } from "@/server/actions/account/auth";

export function CustomerLoginForm() {
  const [state, formAction, isPending] = useActionState(
    requestCustomerMagicLinkAction,
    {},
  );

  if (state.success) {
    return (
      <p className="text-sm leading-relaxed text-emerald-800" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="customer-email" className="text-sm font-medium">
          E-mail
        </label>
        <Input
          id="customer-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.fr"
          required
        />
      </div>
      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Envoi…" : "Recevoir un lien de connexion"}
      </Button>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Pas de mot de passe : un lien sécurisé par e-mail suffit. Vos favoris sont
        fusionnés avec ceux déjà enregistrés sur votre compte.
      </p>
    </form>
  );
}
