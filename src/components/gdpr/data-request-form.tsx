"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitDataRequestAction } from "@/server/actions/gdpr";

export function DataRequestForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean }, formData: FormData) =>
      submitDataRequestAction(formData),
    {},
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border p-6">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      <div className="space-y-2">
        <Label htmlFor="email">E-mail utilisé lors de la commande</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requestType">Type de demande</Label>
        <select
          id="requestType"
          name="requestType"
          required
          className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          defaultValue="access"
        >
          <option value="access">Accès à mes données</option>
          <option value="deletion">Suppression / anonymisation</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (optionnel)</Label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          placeholder="Précisez votre demande si nécessaire."
        />
      </div>

      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="text-sm text-green-700" role="status">
          Demande enregistrée. Nous vous répondrons sous 30 jours.
        </p>
      ) : null}

      <Button type="submit" className="rounded-full" disabled={isPending}>
        {isPending ? "Envoi…" : "Envoyer ma demande"}
      </Button>

      <p className="text-muted-foreground text-xs">
        Vous pouvez aussi nous contacter via les coordonnées des{" "}
        <a
          href="/mentions-legales"
          className="text-primary underline-offset-4 hover:underline"
        >
          mentions légales
        </a>
        . Les commandes comptables peuvent être anonymisées plutôt que supprimées.
      </p>
    </form>
  );
}
