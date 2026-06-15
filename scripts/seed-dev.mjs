#!/usr/bin/env node
/**
 * Charge les produits de démonstration (DEV uniquement).
 * Nécessite Supabase CLI liée : supabase link --project-ref …
 *
 * Usage : npm run seed:dev
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const productsSeed = resolve(root, "supabase/seed.dev-products.sql");

function main() {
  if (!existsSync(productsSeed)) {
    console.error("  ✗ Fichier introuvable : supabase/seed.dev-products.sql");
    process.exit(1);
  }

  console.log("\nTilouki — seed produits de démonstration (DEV UNIQUEMENT)\n");
  console.log("  ⛔ Ne jamais exécuter sur la base de production.\n");

  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: root });
  } catch {
    console.warn("  ⚠ Dépôt git non détecté — poursuite quand même.\n");
  }

  const result = spawnSync("supabase", ["db", "execute", "--file", productsSeed], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.error(
      "\n  ✗ Échec. Vérifiez : supabase login && supabase link --project-ref VOTRE_REF\n",
    );
    process.exit(result.status ?? 1);
  }

  console.log("\n  ✓ 12 produits demo chargés (images : /demo-products/).");
  console.log("  Redémarrez `npm run dev` si le catalogue reste vide (cache Next).\n");
}

main();
