"use client";

import { Download, Loader2 } from "lucide-react";
import { useState, useTransition, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SiretImportFieldRefs {
  legalName: RefObject<HTMLInputElement | null>;
  legalStatus: RefObject<HTMLInputElement | null>;
  address: RefObject<HTMLTextAreaElement | null>;
}

export interface SiretImportResult {
  legalName: string;
  address: string;
  apeCode: string | null;
  suggestedLegalStatus: string | null;
}

interface SiretImportButtonProps {
  siretInputId?: string;
  fieldRefs: SiretImportFieldRefs;
  onImported?: (result: SiretImportResult) => void;
}

type ImportFieldKey = "legalName" | "legalStatus" | "address";

const FIELD_LABELS: Record<ImportFieldKey, string> = {
  legalName: "Nom légal / raison sociale",
  legalStatus: "Statut juridique",
  address: "Adresse professionnelle",
};

function readFieldValue(key: ImportFieldKey, refs: SiretImportFieldRefs): string {
  const element = refs[key].current;
  return element?.value.trim() ?? "";
}

function writeFieldValue(
  key: ImportFieldKey,
  refs: SiretImportFieldRefs,
  value: string,
) {
  const element = refs[key].current;
  if (!element) return;
  element.value = value;
}

export function SiretImportButton({
  siretInputId = "siret",
  fieldRefs,
  onImported,
}: SiretImportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [apeCode, setApeCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<SiretImportResult | null>(null);
  const [conflictLabels, setConflictLabels] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const applyImport = (data: SiretImportResult, overwrite = false) => {
    const proposed: Partial<Record<ImportFieldKey, string>> = {
      legalName: data.legalName,
      address: data.address,
    };
    if (data.suggestedLegalStatus) {
      proposed.legalStatus = data.suggestedLegalStatus;
    }

    for (const [key, value] of Object.entries(proposed) as [ImportFieldKey, string][]) {
      const current = readFieldValue(key, fieldRefs);
      if (!current || overwrite) {
        writeFieldValue(key, fieldRefs, value);
      }
    }

    setApeCode(data.apeCode);
    setSuccessMessage("Données importées depuis le SIRET. Vérifiez puis enregistrez.");
    setError(null);
    onImported?.(data);
  };

  const runImport = (overwrite = false) => {
    const siretInput = document.getElementById(siretInputId) as HTMLInputElement | null;
    const siret = siretInput?.value.trim() ?? "";
    if (!siret) {
      setError("Saisissez d'abord votre numéro SIRET.");
      return;
    }

    startTransition(async () => {
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(
          `/api/admin/company-lookup?siret=${encodeURIComponent(siret)}`,
          { method: "GET", cache: "no-store" },
        );
        const payload: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "Import impossible pour ce SIRET.";
          setError(message);
          return;
        }

        const data = payload as SiretImportResult;
        const conflicts: string[] = [];
        if (
          readFieldValue("legalName", fieldRefs) &&
          readFieldValue("legalName", fieldRefs) !== data.legalName
        ) {
          conflicts.push(FIELD_LABELS.legalName);
        }
        if (
          readFieldValue("address", fieldRefs) &&
          readFieldValue("address", fieldRefs) !== data.address
        ) {
          conflicts.push(FIELD_LABELS.address);
        }
        if (
          data.suggestedLegalStatus &&
          readFieldValue("legalStatus", fieldRefs) &&
          readFieldValue("legalStatus", fieldRefs) !== data.suggestedLegalStatus
        ) {
          conflicts.push(FIELD_LABELS.legalStatus);
        }

        if (conflicts.length > 0 && !overwrite) {
          setPendingImport(data);
          setConflictLabels(conflicts);
          setConfirmOpen(true);
          return;
        }

        applyImport(data, overwrite);
      } catch {
        setError(
          "Impossible de contacter le service d'import SIRET. Réessayez ou complétez manuellement.",
        );
      }
    });
  };

  const confirmOverwrite = () => {
    if (!pendingImport) return;
    applyImport(pendingImport, true);
    setPendingImport(null);
    setConflictLabels([]);
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => runImport(false)}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        Importer depuis mon SIRET
      </Button>

      {apeCode ? (
        <p className="text-muted-foreground text-xs">
          Code APE suggéré (lecture seule) : <strong>{apeCode}</strong>
        </p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {successMessage}
        </p>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remplacer des champs déjà remplis ?</DialogTitle>
            <DialogDescription>
              L&apos;import SIRET propose de nouvelles valeurs pour :{" "}
              {conflictLabels.join(", ")}. Confirmez pour écraser ces champs.
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
            <Button type="button" onClick={confirmOverwrite}>
              Remplacer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
