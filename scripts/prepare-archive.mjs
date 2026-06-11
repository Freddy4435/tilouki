#!/usr/bin/env node
/**
 * Archive de livraison Tilouki — sans secrets ni artefacts générés.
 *
 * Utilise `git archive` : seuls les fichiers suivis par git sont inclus.
 * Les dossiers/fichiers locaux (.env.local, node_modules, .next, .vercel…)
 * ne sont jamais embarqués car ils ne sont pas versionnés.
 *
 * Usage : npm run prepare:archive
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const archivesDir = resolve(root, "archives");

/** Chemins qui ne doivent jamais figurer dans une archive partageable. */
const FORBIDDEN_PATH_FRAGMENTS = [
  ".env.local",
  ".env.vercel",
  ".env.production",
  ".env.development",
  "node_modules/",
  ".next/",
  ".vercel/",
  "/logs/",
];

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
  const result = spawnSync(process.execPath, [resolve(root, "scripts/audit-secrets.mjs")], {
    cwd: root,
    stdio: "inherit",
  });
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
  const violations = [];

  for (const path of paths) {
    for (const forbidden of FORBIDDEN_PATH_FRAGMENTS) {
      if (path.includes(forbidden)) {
        violations.push({ path, reason: forbidden });
      }
    }

    if (/\.env(?!\.example)/.test(path) && !path.endsWith(".env.example")) {
      violations.push({ path, reason: "fichier .env autre que .env.example" });
    }
  }

  if (violations.length > 0) {
    console.error("\n  ✗ Archive refusée — chemins interdits détectés :\n");
    for (const v of violations) {
      console.error(`    ${v.path} (${v.reason})`);
    }
    console.error("");
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

function main() {
  console.log("\nTilouki — archive de livraison (sans secrets)\n");

  assertGitRepo();

  console.log("  1/3 Audit des secrets (fichiers suivis par git)…");
  runSecretAudit();

  console.log("  2/3 Vérification du contenu archivable…");
  const paths = listArchivedPaths();
  assertArchiveIsClean(paths);

  if (!existsSync(archivesDir)) {
    mkdirSync(archivesDir, { recursive: true });
  }

  const date = new Date().toISOString().slice(0, 10);
  const outFile = resolve(archivesDir, `tilouki-${date}.zip`);

  console.log("  3/3 Création de l'archive zip…");
  createArchive(outFile);

  console.log(`\n  ✓ Archive prête : archives/tilouki-${date}.zip`);
  console.log(`    ${paths.length} fichier(s) versionné(s) inclus`);
  console.log("\n  Exclusions garanties (non versionnées) :");
  console.log("    - .env.local, .env.vercel et tout .env* sauf .env.example");
  console.log("    - node_modules/, .next/, .vercel/");
  console.log("    - logs et artefacts de build locaux");
  console.log("\n  Ne partagez jamais vos clés API. Voir README.md → Fichiers à ne jamais partager.\n");
}

main();
