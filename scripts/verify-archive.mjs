#!/usr/bin/env node
/**
 * Vérifie qu'une archive (zip/rar), un dossier ou le dépôt git ne contient pas de secrets / artefacts.
 *
 * Usage :
 *   npm run verify:archive                              → contrôle git ls-files (sans créer de zip)
 *   npm run verify:archive -- archives/tilouki-….zip    → contrôle un zip
 *   npm run verify:archive -- ./export-manuel.rar       → contrôle un rar (7-Zip / UnRAR)
 *   npm run verify:archive -- ./dossier-projet          → contrôle un dossier
 */

import { execFileSync, spawnSync } from "node:child_process";
import { resolve } from "node:path";

import {
  findArchivePathViolations,
  formatArchiveViolations,
} from "./lib/archive-guard.mjs";

const root = resolve(import.meta.dirname, "..");
const targetArg = process.argv[2];

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

function main() {
  console.log("\nTilouki — vérification archive / dépôt\n");

  if (targetArg) {
    const scanScript = resolve(root, "scripts/scan-deliverable.mjs");
    const result = spawnSync(process.execPath, [scanScript, targetArg], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    process.exit(result.status ?? 1);
  }

  assertGitRepo();
  const violations = findArchivePathViolations(listGitTrackedPaths());
  if (violations.length > 0) {
    console.error("  ✗ Dépôt non prêt pour archive — chemins interdits versionnés :\n");
    console.error(`${formatArchiveViolations(violations)}\n`);
    process.exit(1);
  }

  console.log("  ✓ Aucun chemin sensible versionné (git ls-files).");
  console.log("\n  Livrable autorisé : npm run delivery:clean");
  console.log("  ⛔ Ne jamais envoyer un .zip / .rar manuel du dossier projet.\n");
}

main();
