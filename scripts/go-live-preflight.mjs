#!/usr/bin/env node
/**
 * Préflight go-live — Prompt 12
 * 1. scan livrable (pas de secrets dans le dépôt)
 * 2. verify:deploy:prod
 * 3. verify:archive
 * 4. delivery:clean (seule archive autorisée)
 *
 * Usage : npm run go-live:preflight
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function runStep(label, command, args) {
  console.log(`\n── ${label} ──\n`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\n✗ Échec : ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nTilouki — préflight go-live (production & livrable)\n");

runStep("1/4 Audit secrets (fichiers git)", "npm", ["run", "audit:secrets"]);
runStep("2/4 Garde-fou production", "npm", ["run", "verify:deploy:prod"]);
runStep("3/4 Contrôle archive", "npm", ["run", "verify:archive"]);
runStep("4/4 Archive propre", "npm", ["run", "delivery:clean"]);

console.log("\n✓ Préflight technique OK.\n");
console.log("Étapes métier restantes (non automatisables) :");
console.log("  • Admin → Paramètres : e-mail, téléphone, médiateur, REP si adhérent");
console.log("  • Admin → Pages légales : enregistrer les 6 pages sans placeholder");
console.log("  • Recette live petit montant : docs/GO_LIVE_RECETTE.md (Partie B)");
console.log("");
