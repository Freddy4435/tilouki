"use client";

import { AlertCircle, CheckCircle2, FileUp, Loader2, SkipForward } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CSV_IMPORT_TEMPLATE } from "@/lib/admin/csv-parse";
import { formatPrice } from "@/lib/utils";
import {
  executeProductImportAction,
  previewProductImportAction,
} from "@/server/actions/admin/import";
import type { ImportExecuteResult, ImportPreviewResult } from "@/lib/validations/product-import";

type Step = "upload" | "preview" | "done";

function statusBadge(status: string) {
  switch (status) {
    case "valid":
      return <Badge variant="default">Valide</Badge>;
    case "duplicate":
      return <Badge variant="secondary">Doublon</Badge>;
    case "error":
      return <Badge variant="destructive">Erreur</Badge>;
    case "imported":
      return <Badge variant="default">Importé</Badge>;
    case "skipped":
      return <Badge variant="secondary">Ignoré</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function ProductImportFlow() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [result, setResult] = useState<ImportExecuteResult | null>(null);

  const readFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setCsvContent(text);
      setFileName(file.name);
      startTransition(async () => {
        const response = await previewProductImportAction(text);
        if (response.error) {
          setError(response.error);
          return;
        }
        if (response.preview?.headerError) {
          setError(response.preview.headerError);
          setPreview(response.preview);
          setStep("preview");
          return;
        }
        setPreview(response.preview ?? null);
        setStep("preview");
      });
    };
    reader.onerror = () => setError("Impossible de lire le fichier.");
    reader.readAsText(file, "UTF-8");
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readFile(file);
  };

  const reset = () => {
    setStep("upload");
    setCsvContent(null);
    setFileName(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const runImport = () => {
    if (!csvContent) return;
    startTransition(async () => {
      setError(null);
      const response = await executeProductImportAction(csvContent);
      if (response.error) {
        setError(response.error);
        return;
      }
      setResult(response.result ?? null);
      setStep("done");
    });
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_IMPORT_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-import-tilouki.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Format attendu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Colonnes :{" "}
            <code className="text-xs">
              category,name,description,material,season,made_in,gender,color,size_label,age_label,price_cents,cost_cents,stock_quantity,weight_grams,image_url
            </code>
          </p>
          <p className="text-muted-foreground text-xs">
            Encodage UTF-8 (accents français supportés). Séparateur virgule ou point-virgule.
            Une ligne = une variante. Même nom de produit = variantes du même produit.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
            Télécharger un modèle CSV
          </Button>
        </CardContent>
      </Card>

      {step === "upload" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFileChange}
            />
            <FileUp className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-center text-sm">
              Importez un fichier CSV pour afficher la prévisualisation avant validation.
            </p>
            <Button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyse…
                </>
              ) : (
                "Choisir un fichier CSV"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {step === "preview" && preview ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{fileName}</p>
              <p className="text-muted-foreground text-xs">
                Séparateur détecté : « {preview.separator === ";" ? ";" : ","} » —{" "}
                {preview.summary.total} ligne(s)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{preview.summary.valid} valide(s)</Badge>
              <Badge variant="secondary">{preview.summary.duplicate} doublon(s)</Badge>
              <Badge variant="destructive">{preview.summary.error} erreur(s)</Badge>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ligne</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.map((row) => (
                  <TableRow key={row.lineNumber}>
                    <TableCell className="tabular-nums">{row.lineNumber}</TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                    <TableCell className="font-medium">{row.data?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.data?.category ?? "—"}
                    </TableCell>
                    <TableCell>{row.data?.size_label ?? "—"}</TableCell>
                    <TableCell>{row.data?.color ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.data ? formatPrice(row.data.price_cents) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.data?.stock_quantity ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] text-xs">
                      {row.message ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={reset} disabled={isPending}>
              Changer de fichier
            </Button>
            <Button
              type="button"
              disabled={isPending || preview.summary.valid === 0}
              onClick={runImport}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Import en cours…
                </>
              ) : (
                `Importer ${preview.summary.valid} ligne(s) valide(s)`
              )}
            </Button>
          </div>
        </>
      ) : null}

      {step === "done" && result ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rapport d&apos;import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <CheckCircle2 className="text-primary size-5" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{result.imported}</p>
                  <p className="text-muted-foreground text-xs">Importé(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <SkipForward className="text-muted-foreground size-5" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{result.skipped}</p>
                  <p className="text-muted-foreground text-xs">Ignoré(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <AlertCircle className="text-destructive size-5" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{result.errors}</p>
                  <p className="text-muted-foreground text-xs">Erreur(s)</p>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              {result.categoriesCreated} catégorie(s) créée(s) · {result.productsCreated}{" "}
              produit(s) créé(s) · {result.variantsCreated} variante(s) créée(s)
            </p>

            {result.details.length > 0 ? (
              <div className="max-h-64 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ligne</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Détail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.details.map((d) => (
                      <TableRow key={`${d.lineNumber}-${d.status}`}>
                        <TableCell>{d.lineNumber}</TableCell>
                        <TableCell>{statusBadge(d.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {d.message ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}

            <Button type="button" onClick={reset}>
              Nouvel import
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
