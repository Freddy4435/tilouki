"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { adminLoginAction } from "@/server/actions/admin/auth";

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@tilouki.fr"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Connexion…" : "Se connecter"}
      </Button>
      <p className="text-muted-foreground text-center text-xs">
        Accès réservé aux administrateurs enregistrés. Aucune inscription publique.
      </p>
      <ButtonLink href="/" variant="link" className="w-full">
        Retour à la boutique
      </ButtonLink>
    </form>
  );
}
