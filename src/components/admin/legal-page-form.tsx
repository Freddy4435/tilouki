"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LEGAL_PAGE_ROUTES,
  LEGAL_PLACEHOLDER_KEYS,
  type LegalPageSlug,
} from "@/lib/legal/templates";
import type { AdminLegalPage } from "@/lib/supabase/queries/admin/legal";
import {
  resetLegalPageTemplateAction,
  updateLegalPageAction,
} from "@/server/actions/admin/legal";

interface LegalPageFormProps {
  page: AdminLegalPage;
}

export function LegalPageForm({ page }: LegalPageFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isResetting, startResetTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const publicPath = LEGAL_PAGE_ROUTES[page.slug as LegalPageSlug] ?? `/${page.slug}`;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      setError(null);
      const result = await updateLegalPageAction(form);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const onResetTemplate = () => {
    if (
      !window.confirm(
        "Restaurer le modèle par défaut ? Le contenu actuel sera remplacé (le titre aussi).",
      )
    ) {
      return;
    }

    startResetTransition(async () => {
      setError(null);
      const result = await resetLegalPageTemplateAction(page.slug);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="id" value={page.id} />
      <input type="hidden" name="slug" value={page.slug} />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          Voir la page publique ↗
        </Link>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`title-${page.slug}`}>Titre</Label>
        <Input
          id={`title-${page.slug}`}
          name="title"
          defaultValue={page.title}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`content-${page.slug}`}>Contenu (HTML)</Label>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Base structurée à personnaliser — ne remplace pas un avis juridique. Utilisez
          les variables <code className="bg-muted rounded px-1">{"{{nom}}"}</code>{" "}
          remplies automatiquement depuis les paramètres boutique :{" "}
          {LEGAL_PLACEHOLDER_KEYS.map((key) => (
            <code key={key} className="bg-muted mr-1 inline-block rounded px-1">
              {`{{${key}}}`}
            </code>
          ))}
          . Les passages <em>« À valider avec un professionnel du droit »</em> doivent
          être relus avant publication.
        </p>
        <textarea
          id={`content-${page.slug}`}
          name="content"
          rows={18}
          defaultValue={page.content}
          className="border-input bg-background w-full rounded-lg border px-2.5 py-2 font-mono text-xs"
        />
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending || isResetting}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending || isResetting}
          onClick={onResetTemplate}
        >
          {isResetting ? "Restauration…" : "Restaurer le modèle"}
        </Button>
      </div>
    </form>
  );
}
