"use client";

import { FileStack, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateAllLegalPagesAction } from "@/server/actions/admin/legal";

export function LegalPagesBulkGenerate() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pagesToOverwrite, setPagesToOverwrite] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const runGenerate = (confirmOverwrite: boolean) => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);

      const result = await generateAllLegalPagesAction(confirmOverwrite);
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.needsConfirmation && result.pagesToOverwrite?.length) {
        setPagesToOverwrite(result.pagesToOverwrite);
        setConfirmOpen(true);
        return;
      }

      setSuccess(
        `${result.generatedCount ?? 0} page(s) légale(s) générée(s) à partir des paramètres boutique.`,
      );
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Génération des pages légales</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Instancie les modèles (mentions légales, CGV, confidentialité, cookies,
            rétractation, livraison-retours) avec les variables{" "}
            <code className="bg-muted rounded px-1">{"{{…}}"}</code> remplies depuis les
            paramètres. La franchise TVA (293 B), le médiateur, l&apos;IDU REP et la
            ligne RCS apparaissent automatiquement quand les champs sont renseignés.
          </p>
        </div>
        <Button type="button" disabled={isPending} onClick={() => runGenerate(false)}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileStack className="size-4" />
          )}
          Générer / régénérer toutes les pages
        </Button>
      </div>

      {success ? (
        <p
          className="mt-3 text-sm text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          {success}
        </p>
      ) : null}

      {error ? (
        <p className="text-destructive mt-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Écraser des pages modifiées manuellement ?</DialogTitle>
            <DialogDescription>
              Les pages suivantes contiennent des modifications personnalisées et seront
              remplacées par les modèles à jour : {pagesToOverwrite.join(", ")}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => runGenerate(true)}
            >
              {isPending ? "Génération…" : "Confirmer la régénération"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
