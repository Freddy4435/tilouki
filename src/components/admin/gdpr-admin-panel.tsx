"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { anonymizeCustomerDataAction } from "@/server/actions/gdpr";

export function GdprAdminPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onAnonymize = () => {
    if (
      !window.confirm(
        `Anonymiser toutes les commandes associées à ${email} ? Cette action est irréversible pour les données personnelles.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await anonymizeCustomerDataAction(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(
        result.count
          ? `${result.count} commande${result.count > 1 ? "s" : ""} anonymisée${result.count > 1 ? "s" : ""}.`
          : "Aucune commande trouvée pour cet e-mail.",
      );
      setEmail("");
    });
  };

  return (
    <fieldset className="space-y-4 rounded-xl border p-4">
      <legend className="px-1 text-sm font-semibold">
        RGPD — anonymisation commandes
      </legend>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Suite à une demande de suppression reçue sur{" "}
        <a
          href="/donnees-personnelles"
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          /donnees-personnelles
        </a>
        , anonymisez les données personnelles tout en conservant les montants pour la
        comptabilité.
      </p>
      <div className="space-y-2">
        <Label htmlFor="gdprAnonymizeEmail">E-mail client</Label>
        <Input
          id="gdprAnonymizeEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="client@example.com"
          autoComplete="off"
        />
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-700" role="status">
          {message}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        disabled={isPending || !email.trim()}
        onClick={onAnonymize}
      >
        {isPending ? "Anonymisation…" : "Anonymiser les commandes"}
      </Button>
    </fieldset>
  );
}
