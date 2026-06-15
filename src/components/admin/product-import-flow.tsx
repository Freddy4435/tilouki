"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileUp,
  Loader2,
  Package,
  SkipForward,
} from "lucide-react";
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
import { CSV_IMPORT_HEADERS } from "@/lib/admin/csv-parse";
import { formatPrice } from "@/lib/utils";
import {
  executeProductImportAction,
  previewProductImportAction,
} from "@/server/actions/admin/import";
import type {
  ImportExecuteResult,
  ImportPreviewResult,
} from "@/lib/validations/product-import";

type Step = "upload" | "preview" | "done";

const TEMPLATE_URL = "/import-produits-exemple.csv";
const CATALOG_TEMPLATE_URL = "/import-catalogue-tilouki.csv";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Format CSV attendu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Une ligne = une variante (taille/âge). Même <strong>reference</strong> =
            même modèle, tailles différentes.
          </p>
          <p className="text-muted-foreground text-xs">
            Colonnes (anglais ou alias français : référence, catégorie, nom,
            composition, saison, genre, couleur, taille, âge, prix, stock, poids, image)
            : <code className="text-xs">{CSV_IMPORT_HEADERS.join(",")}</code>
          </p>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
            <li>Encodage UTF-8 — séparateur virgule ou point-virgule (Excel FR)</li>
            <li>
              Prix en euros avec virgule française : <code>19,90</code>
            </li>
            <li>
              Image : URL https ou chemin local <code>/products/…</code>
            </li>
            <li>Doublons refusés : reference + size_label + color</li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <a
              href={TEMPLATE_URL}
              download="import-produits-exemple.csv"
              className="border-input bg-background hover:bg-muted inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium"
            >
              <Download className="size-4" />
              Modèle court (2 produits)
            </a>
            <a
              href={CATALOG_TEMPLATE_URL}
              download="import-catalogue-tilouki.csv"
              className="border-input bg-background hover:bg-muted inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium"
            >
              <Download className="size-4" />
              Catalogue complet (20 produits)
            </a>
          </div>
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
            <p className="text-muted-foreground max-w-md text-center text-sm">
              Importez un export Excel / CSV. La prévisualisation affiche les erreurs
              ligne par ligne avant validation.
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
                Séparateur : « {preview.separator === ";" ? ";" : ","} » —{" "}
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
                  <TableHead>Réf.</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.map((row) => (
                  <TableRow
                    key={row.lineNumber}
                    className={
                      row.status === "error"
                        ? "bg-destructive/5"
                        : row.status === "duplicate"
                          ? "bg-muted/40"
                          : undefined
                    }
                  >
                    <TableCell className="tabular-nums">{row.lineNumber}</TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.data?.reference ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate font-medium">
                      {row.data?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.data?.category ?? "—"}
                    </TableCell>
                    <TableCell>{row.data?.size_label ?? "—"}</TableCell>
                    <TableCell>{row.data?.age_label ?? "—"}</TableCell>
                    <TableCell>{row.data?.color ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.data ? formatPrice(row.data.price_cents) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.data?.stock_quantity ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[180px] text-xs">
                      {row.message ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              disabled={isPending}
            >
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
                `Importer ${preview.summary.valid} variante(s)`
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Package className="text-primary size-5" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {result.productsCreated}
                  </p>
                  <p className="text-muted-foreground text-xs">Produit(s) créé(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <CheckCircle2 className="text-primary size-5" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {result.variantsCreated}
                  </p>
                  <p className="text-muted-foreground text-xs">Variante(s) créée(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <SkipForward className="text-muted-foreground size-5" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {result.skipped}
                  </p>
                  <p className="text-muted-foreground text-xs">Ligne(s) ignorée(s)</p>
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
              {result.categoriesCreated} catégorie(s) créée(s) · {result.imported}{" "}
              ligne(s) importée(s) au total
            </p>

            {result.details.length > 0 ? (
              <div className="max-h-72 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ligne</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Détail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.details.map((d, i) => (
                      <TableRow key={`${d.lineNumber}-${d.status}-${i}`}>
                        <TableCell className="tabular-nums">{d.lineNumber}</TableCell>
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
