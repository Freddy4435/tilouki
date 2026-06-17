#!/usr/bin/env node
/**
 * Charge le catalogue vendable (20 produits TK-).
 * Nécessite Supabase CLI liée : supabase link --project-ref …
 *
 * Usage : npm run seed:catalog
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { executeSqlFile } from "./lib/execute-sql-file.mjs";
import { loadProjectEnv } from "./lib/load-env-files.mjs";

const root = resolve(import.meta.dirname, "..");
const catalogSeed = resolve(root, "supabase/seed.catalog-products.sql");

function main() {
  loadProjectEnv({ production: false });

  if (!existsSync(catalogSeed)) {
    console.error("  ✗ Fichier introuvable : supabase/seed.catalog-products.sql");
    console.error("  Exécutez d'abord : npm run generate:catalog\n");
    process.exit(1);
  }

  console.log("\nTilouki — seed catalogue vendable (20 produits)\n");

  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: root });
  } catch {
    console.warn("  ⚠ Dépôt git non détecté — poursuite quand même.\n");
  }

  const status = executeSqlFile(catalogSeed, { cwd: root });

  if (status !== 0) {
    console.error(
      "\n  ✗ Échec. Vérifiez : supabase login && supabase link --project-ref VOTRE_REF\n",
    );
    process.exit(status ?? 1);
  }

  console.log("\n  ✓ 20 produits catalogue chargés (images : /products/, SKU TK-).");
  console.log("  Redémarrez `npm run dev` si le catalogue reste vide (cache Next).\n");
}

main();
