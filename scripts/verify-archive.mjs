#!/usr/bin/env node
/**
 * Vérifie qu'une archive (zip/rar), un dossier ou le dépôt git ne contient pas de secrets / artefacts.
 *
 * Usage :
 *   npm run verify:archive                              → contrôle git ls-files (sans créer de zip)
 *   npm run verify:archive -- --latest                  → contrôle le zip le plus récent dans archives/
 *   npm run verify:archive -- archives/tilouki-….zip    → contrôle un zip
 *   npm run verify:archive -- ./export-manuel.rar       → contrôle un rar (7-Zip / UnRAR)
 *   npm run verify:archive -- ./dossier-projet          → contrôle un dossier
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import {
  ARCHIVE_MANDATORY_EXCLUSION_KEYS,
  findArchivePathViolations,
  findMandatoryExclusionViolations,
  formatArchiveViolations,
} from "./lib/archive-guard.mjs";

const root = resolve(import.meta.dirname, "..");
const archivesDir = resolve(root, "archives");
const args = process.argv.slice(2);
const latestFlag = args.includes("--latest");
const targetArg = args.find((arg) => arg !== "--latest");

function assertGitRepo() {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd: root,
      encoding: "utf8",
    });
  } catch {
    console.error("  ✗ Dépôt git requis.\n");
    process.exit(1);
  }
}

function listGitTrackedPaths() {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);
}

function findLatestArchivePath() {
  if (!existsSync(archivesDir)) {
    console.error(
      "  ✗ Dossier archives/ introuvable. Lancez d'abord npm run delivery:clean\n",
    );
    process.exit(1);
  }

  const zips = readdirSync(archivesDir)
    .filter((name) => name.toLowerCase().endsWith(".zip"))
    .sort()
    .reverse();

  if (zips.length === 0) {
    console.error("  ✗ Aucune archive dans archives/. Lancez npm run delivery:clean\n");
    process.exit(1);
  }

  return resolve(archivesDir, zips[0]);
}

function assertRepoReadyForArchive(paths) {
  const violations = [
    ...findMandatoryExclusionViolations(paths),
    ...findArchivePathViolations(paths),
  ];

  const seen = new Set();
  const deduped = violations.filter((violation) => {
    const key = `${violation.path}::${violation.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length > 0) {
    console.error("  ✗ Dépôt non prêt pour archive — chemins interdits versionnés :\n");
    console.error(`${formatArchiveViolations(deduped)}\n`);
    process.exit(1);
  }
}

function main() {
  console.log("\nTilouki — vérification archive / dépôt\n");

  const scanTarget = latestFlag ? findLatestArchivePath() : targetArg;

  if (scanTarget) {
    const scanScript = resolve(root, "scripts/scan-deliverable.mjs");
    const result = spawnSync(process.execPath, [scanScript, scanTarget], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    process.exit(result.status ?? 1);
  }

  assertGitRepo();
  const paths = listGitTrackedPaths();
  assertRepoReadyForArchive(paths);

  console.log("  ✓ Aucun chemin sensible versionné (git ls-files).");
  console.log("\n  Exclusions obligatoires contrôlées :");
  for (const key of ARCHIVE_MANDATORY_EXCLUSION_KEYS) {
    console.log(`    - ${key}`);
  }
  console.log("\n  Livrable autorisé : npm run delivery:clean");
  console.log("  Procédure complète : npm run delivery:release");
  console.log("  ⛔ Ne jamais envoyer un .zip / .rar manuel du dossier projet.\n");
}

main();
