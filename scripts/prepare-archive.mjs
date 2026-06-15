#!/usr/bin/env node
/**
 * Archive de livraison Tilouki — sans secrets ni artefacts générés.
 *
 * Utilise `git archive` : seuls les fichiers suivis par git sont inclus.
 * Les dossiers/fichiers locaux (.env.local, node_modules, .next, .vercel…)
 * ne sont jamais embarqués car ils ne sont pas versionnés.
 *
 * Usage : npm run delivery:clean  (alias : npm run archive:clean, npm run prepare:archive)
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import {
  findArchivePathViolations,
  findDeliverableViolations,
  formatArchiveViolations,
} from "./lib/archive-guard.mjs";

const root = resolve(import.meta.dirname, "..");
const archivesDir = resolve(root, "archives");

function assertGitRepo() {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd: root,
      encoding: "utf8",
    });
  } catch {
    console.error("  ✗ Dépôt git requis. Initialisez git avant de créer une archive.");
    process.exit(1);
  }
}

function runSecretAudit() {
  const result = spawnSync(
    process.execPath,
    [resolve(root, "scripts/audit-secrets.mjs")],
    {
      cwd: root,
      stdio: "inherit",
    },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function listArchivedPaths() {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);
}

function assertArchiveIsClean(paths) {
  const violations = findArchivePathViolations(paths);
  if (violations.length > 0) {
    console.error("\n  ✗ Archive refusée — chemins interdits détectés :\n");
    console.error(`${formatArchiveViolations(violations)}\n`);
    process.exit(1);
  }
}

function createArchive(outFile) {
  execFileSync(
    "git",
    ["archive", "--format=zip", `--output=${outFile}`, "--prefix=tilouki/", "HEAD"],
    { cwd: root, stdio: "inherit" },
  );
}

function listZipEntries(zipPath) {
  const out = execFileSync("tar", ["-tf", zipPath], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split("\n").filter(Boolean);
}

function assertZipArchiveIsClean(entries) {
  const violations = findDeliverableViolations(entries);
  if (violations.length > 0) {
    console.error("\n  ✗ Archive zip invalide — contenu interdit détecté :\n");
    console.error(`${formatArchiveViolations(violations)}\n`);
    process.exit(1);
  }
}

function main() {
  console.log("\nTilouki — archive de livraison (sans secrets)\n");

  assertGitRepo();

  console.log("  1/4 Audit des secrets (fichiers suivis par git)…");
  runSecretAudit();

  console.log("  2/4 Vérification du contenu archivable…");
  const paths = listArchivedPaths();
  assertArchiveIsClean(paths);

  if (!existsSync(archivesDir)) {
    mkdirSync(archivesDir, { recursive: true });
  }

  const date = new Date().toISOString().slice(0, 10);
  const outFile = resolve(archivesDir, `tilouki-${date}.zip`);

  console.log("  3/4 Création de l'archive zip…");
  createArchive(outFile);

  console.log("  4/4 Vérification du contenu du zip…");
  const zipEntries = listZipEntries(outFile);
  assertZipArchiveIsClean(zipEntries);

  console.log(`\n  ✓ Archive prête : archives/tilouki-${date}.zip`);
  console.log(`    ${paths.length} fichier(s) versionné(s) inclus`);
  console.log("\n  Exclusions garanties (non versionnées ou bloquées) :");
  console.log("    - .env* sauf .env.example");
  console.log("    - node_modules/, .next/, .vercel/, .email-preview/");
  console.log("    - supabase/.temp/, tsconfig.tsbuildinfo");
  console.log("    - archives/, playwright-report/, test-results/, blob-report/");
  console.log("    - fichiers *.zip / *.rar à la racine du dépôt");
  console.log("\n  ⛔ LIVRABLE INTERDIT : zip / .rar manuel du dossier projet.");
  console.log("  Seule méthode autorisée : npm run delivery:clean");
  console.log("  Contrôler un export suspect : npm run scan:deliverable -- <chemin>");
  console.log("  En cas de fuite : docs/rotation-secrets-apres-fuite-archive.md\n");
}

main();
