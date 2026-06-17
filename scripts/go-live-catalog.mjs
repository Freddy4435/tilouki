#!/usr/bin/env node
/**
 * Bascule catalogue production : charge les 20 produits réels (TK-) et désactive les démos (DEV-).
 *
 * Par défaut : --dry-run (aucune modification).
 * Application : npm run catalog:go-live -- --apply
 *
 * Prérequis :
 *   - Supabase liée (supabase link) pour le chargement catalogue
 *   - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY pour l'état DB / désactivation
 *
 * ⛔ Aucune suppression physique — les démos passent en brouillon uniquement.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { DEV_SEED_PRODUCT_SLUGS } from "./lib/dev-seed-slugs.mjs";
import { executeSqlFile } from "./lib/execute-sql-file.mjs";
import { loadProjectEnv } from "./lib/load-env-files.mjs";
import {
  CATALOG_PRODUCT_SLUGS,
  DEMO_DEACTIVATION_STATUS,
  planDemoDeactivation,
  slugsToDeactivate,
} from "./lib/go-live-catalog.mjs";

const root = resolve(import.meta.dirname, "..");
const catalogSeed = resolve(root, "supabase/seed.catalog-products.sql");
const auditScript = resolve(root, "scripts/audit-secrets.mjs");

const apply = process.argv.includes("--apply");

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`\n  ✗ Variable requise : ${name}\n`);
    process.exit(1);
  }
  return value;
}

function runSecretsAudit() {
  console.log("  1/3 — Audit des secrets…\n");
  const result = spawnSync(process.execPath, [auditScript], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error("\n  ✗ Audit secrets en échec — bascule catalogue refusée.\n");
    process.exit(result.status ?? 1);
  }
}

function assertCatalogSeedFile() {
  if (!existsSync(catalogSeed)) {
    console.error("  ✗ Fichier introuvable : supabase/seed.catalog-products.sql");
    console.error("  Exécutez d'abord : npm run generate:catalog\n");
    process.exit(1);
  }
}

function loadCatalogSeed(execute) {
  console.log(
    `\n  2/3 — Catalogue réel (${CATALOG_PRODUCT_SLUGS.length} produits TK-)…\n`,
  );

  for (const slug of CATALOG_PRODUCT_SLUGS) {
    console.log(`    • ${slug} — chargement / mise à jour (UPSERT)`);
  }

  if (!execute) {
    console.log(
      `\n  [dry-run] Exécuterait : supabase db query --linked --file supabase/seed.catalog-products.sql`,
    );
    return;
  }

  const status = executeSqlFile(catalogSeed, { cwd: root });

  if (status !== 0) {
    console.error(
      "\n  ✗ Échec chargement catalogue. Vérifiez : supabase login && supabase link\n",
    );
    process.exit(status ?? 1);
  }

  console.log("\n  ✓ Catalogue réel chargé (UPSERT par slug, sans DELETE).");
}

async function fetchDemoProducts(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, status")
    .in("slug", DEV_SEED_PRODUCT_SLUGS);

  if (error) {
    console.error("  ✗ Lecture produits démo :", error.message);
    process.exit(1);
  }

  return data ?? [];
}

async function fetchDemoSlugsWithOrders(supabase, demoProducts) {
  if (demoProducts.length === 0) {
    return [];
  }

  const demoIds = demoProducts.map((p) => p.id);
  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("id, product_id")
    .in("product_id", demoIds);

  if (variantError) {
    console.error("  ✗ Lecture variantes démo :", variantError.message);
    process.exit(1);
  }

  const rows = variants ?? [];
  if (rows.length === 0) {
    return [];
  }

  const variantIds = rows.map((v) => v.id);
  const { data: orderItems, error: orderError } = await supabase
    .from("order_items")
    .select("variant_id")
    .in("variant_id", variantIds);

  if (orderError) {
    console.error("  ✗ Lecture commandes (order_items) :", orderError.message);
    process.exit(1);
  }

  const orderedVariantIds = new Set((orderItems ?? []).map((row) => row.variant_id));
  const productIdsWithOrders = new Set(
    rows.filter((v) => orderedVariantIds.has(v.id)).map((v) => v.product_id),
  );

  return demoProducts.filter((p) => productIdsWithOrders.has(p.id)).map((p) => p.slug);
}

async function countActiveCatalogProducts(supabase) {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .in("slug", CATALOG_PRODUCT_SLUGS);

  if (error) {
    console.error("  ✗ Comptage catalogue actif :", error.message);
    process.exit(1);
  }

  return count ?? 0;
}

function printDemoPlan(plan) {
  console.log(`\n  Produits démo (${DEV_SEED_PRODUCT_SLUGS.length} slugs) :\n`);

  if (plan.catalogReplacement.length > 0) {
    console.log(
      `    Recouverts par le catalogue (UPSERT, ${plan.catalogReplacement.length}) :`,
    );
    for (const row of plan.catalogReplacement) {
      console.log(`      • ${row.slug}`);
    }
    console.log("");
  }

  if (plan.toDeactivate.length > 0) {
    console.log(
      `    À passer en brouillon (${plan.toDeactivate.length}) — status → ${DEMO_DEACTIVATION_STATUS} :`,
    );
    for (const row of plan.toDeactivate) {
      console.log(`      • ${row.slug} — ${row.name}`);
    }
    console.log("");
  }

  if (plan.skippedDueToOrders.length > 0) {
    console.log(
      `    ⚠ AVERTISSEMENT — référencés par une commande (${plan.skippedDueToOrders.length}), non modifiés :`,
    );
    for (const row of plan.skippedDueToOrders) {
      console.log(`      • ${row.slug} — ${row.name} (status: ${row.status})`);
    }
    console.log("");
  }

  if (plan.alreadyInactive.length > 0) {
    console.log(`    Déjà inactifs / absents (${plan.alreadyInactive.length}) :`);
    for (const row of plan.alreadyInactive) {
      console.log(`      • ${row.slug} (${row.status})`);
    }
    console.log("");
  }
}

async function deactivateExclusiveDemos(supabase, slugs, execute) {
  if (slugs.length === 0) {
    return 0;
  }

  if (!execute) {
    return slugs.length;
  }

  const { data, error } = await supabase
    .from("products")
    .update({ status: DEMO_DEACTIVATION_STATUS })
    .in("slug", slugs)
    .eq("status", "active")
    .select("id, slug");

  if (error) {
    console.error("\n  ✗ Désactivation démos :", error.message);
    process.exit(1);
  }

  return data?.length ?? 0;
}

async function main() {
  loadProjectEnv({ production: false });

  console.log("\nTilouki — bascule catalogue (go-live)\n");
  console.log(
    `  Mode : ${apply ? "APPLICATION (--apply)" : "dry-run (ajoutez --apply pour exécuter)"}\n`,
  );

  assertCatalogSeedFile();
  runSecretsAudit();

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const demoProducts = await fetchDemoProducts(supabase);
  const orderSlugs = await fetchDemoSlugsWithOrders(supabase, demoProducts);
  const plan = planDemoDeactivation({
    demoProducts,
    catalogSlugs: CATALOG_PRODUCT_SLUGS,
    orderSlugs,
  });

  const deactivateSlugs = slugsToDeactivate(plan);

  loadCatalogSeed(apply);

  console.log(`\n  3/3 — Désactivation produits démo exclusifs…`);
  printDemoPlan(plan);

  const deactivatedCount = await deactivateExclusiveDemos(
    supabase,
    deactivateSlugs,
    apply,
  );

  const activeCatalogCount = await countActiveCatalogProducts(supabase);

  console.log("  ── Récapitulatif ──\n");
  console.log(`    Produits catalogue actifs (TK-) : ${activeCatalogCount}`);
  console.log(
    `    Démos recouvertes par catalogue     : ${plan.catalogReplacement.length}`,
  );
  console.log(
    `    Démos désactivés (brouillon)        : ${apply ? deactivatedCount : deactivateSlugs.length}${apply ? "" : " (prévu)"}`,
  );

  if (plan.skippedDueToOrders.length > 0) {
    console.log(
      `    Démos protégés (commandes)          : ${plan.skippedDueToOrders.length} ⚠`,
    );
  }

  console.log("\n    ⛔ Aucune suppression physique (FK order_items).");

  if (!apply) {
    console.log("\n  [dry-run] Relancez avec : npm run catalog:go-live -- --apply\n");
    process.exit(0);
  }

  console.log(
    "\n  ✓ Bascule catalogue terminée. Redémarrez `npm run dev` si besoin (cache).\n",
  );
}

main();
