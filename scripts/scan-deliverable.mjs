#!/usr/bin/env node
/**
 * Scanne un livrable (zip, rar ou dossier) et échoue si un chemin interdit est présent.
 * N'affiche jamais le contenu des fichiers — uniquement les chemins et motifs interdits.
 *
 * Usage :
 *   npm run scan:deliverable -- ./mon-export.zip
 *   npm run scan:deliverable -- ./dossier-projet
 *   npm run scan:deliverable -- ./tilouki-manuel.rar
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

import {
  findDeliverableViolations,
  formatArchiveViolations,
} from "./lib/archive-guard.mjs";

const targetArg = process.argv[2];

function usage() {
  console.error(`
Usage : npm run scan:deliverable -- <chemin>

  <chemin>  Archive .zip / .rar ou dossier à contrôler avant envoi.

Exemples :
  npm run scan:deliverable -- archives/tilouki-2026-06-15.zip
  npm run scan:deliverable -- C:/Downloads/tilouki-manuel.rar
  npm run scan:deliverable -- .

⛔ Un scan « propre » ne rend pas une archive manuelle acceptable.
   Seul livrable autorisé : npm run delivery:release
`);
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function listDirectoryPaths(dir) {
  /** @type {string[]} */
  const paths = [];

  function walk(currentDir, prefix = "") {
    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name === ".git") continue;

      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      paths.push(rel.replace(/\\/g, "/"));
      if (entry.isDirectory()) {
        walk(`${currentDir}/${entry.name}`, rel);
      }
    }
  }

  walk(dir);
  return paths;
}

/**
 * @param {string} zipPath
 * @returns {string[]}
 */
function listZipEntries(zipPath) {
  const out = execFileSync("tar", ["-tf", zipPath], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split("\n").filter(Boolean);
}

/**
 * @param {string} rarPath
 * @returns {string[]}
 */
function listRarEntries(rarPath) {
  const commands = [
    ["7z", ["l", "-ba", rarPath]],
    ["7z.exe", ["l", "-ba", rarPath]],
    ["unrar", ["lb", rarPath]],
    ["UnRAR", ["lb", rarPath]],
  ];

  for (const [cmd, args] of commands) {
    const result = spawnSync(cmd, args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.status === 0 && result.stdout?.trim()) {
      return result.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }

  console.error(
    "\n  ✗ Impossible de lire le .rar (installez 7-Zip ou UnRAR, ou extrayez puis scannez le dossier).\n",
  );
  process.exit(1);
}

/**
 * @param {string} targetPath
 * @returns {{ kind: string, paths: string[] }}
 */
function collectPaths(targetPath) {
  const stat = statSync(targetPath);
  if (stat.isDirectory()) {
    return { kind: "dossier", paths: listDirectoryPaths(targetPath) };
  }

  const ext = extname(targetPath).toLowerCase();
  if (ext === ".zip") {
    return { kind: "zip", paths: listZipEntries(targetPath) };
  }
  if (ext === ".rar") {
    return { kind: "rar", paths: listRarEntries(targetPath) };
  }

  console.error(`\n  ✗ Type non supporté : ${ext || "(sans extension)"}`);
  console.error("  Utilisez un dossier, un .zip ou un .rar.\n");
  process.exit(1);
}

function main() {
  if (!targetArg) {
    usage();
    process.exit(1);
  }

  const targetPath = resolve(process.cwd(), targetArg);
  if (!existsSync(targetPath)) {
    console.error(`\n  ✗ Chemin introuvable : ${targetArg}\n`);
    process.exit(1);
  }

  console.log(`\nTilouki — scan livrable (${basename(targetPath)})\n`);

  const { kind, paths } = collectPaths(targetPath);
  const violations = findDeliverableViolations(paths);

  if (violations.length > 0) {
    console.error(`  ✗ Livrable REFUSÉ (${kind}) — chemins interdits détectés :\n`);
    console.error(`${formatArchiveViolations(violations)}\n`);
    console.error("  ⛔ Ne partagez pas ce fichier. Créez une archive propre :");
    console.error("     npm run delivery:clean\n");
    console.error(
      "  Si ce livrable a déjà été envoyé : docs/rotation-secrets-apres-fuite-archive.md\n",
    );
    process.exit(1);
  }

  console.log(
    `  ✓ Aucun chemin interdit détecté dans ce ${kind} (${paths.length} entrée(s)).`,
  );
  console.log("\n  Note : un scan propre ne valide pas une archive manuelle.");
  console.log("  Seul livrable autorisé à transmettre : npm run delivery:release\n");
}

main();
