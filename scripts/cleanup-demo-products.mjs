#!/usr/bin/env node
/**
 * Désactive les produits de démonstration (seed dev) — utilitaire manuel, JAMAIS en CI.
 *
 * Par défaut : mode --dry-run (affiche sans modifier).
 * Pour appliquer : node scripts/cleanup-demo-products.mjs --apply
 *
 * Variables requises :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

import { DEV_SEED_PRODUCT_SLUGS } from "./lib/dev-seed-slugs.mjs";
import { loadProjectEnv } from "./lib/load-env-files.mjs";

const apply = process.argv.includes("--apply");

async function main() {
  loadProjectEnv({ production: false });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    console.error(
      "\n  ✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.\n",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("\nTilouki — désactivation produits démo\n");
  console.log(
    `  Mode : ${apply ? "APPLICATION" : "dry-run (ajoutez --apply pour modifier)"}\n`,
  );

  const { data: active, error: selectError } = await supabase
    .from("products")
    .select("id, name, slug, status")
    .in("slug", DEV_SEED_PRODUCT_SLUGS)
    .eq("status", "active");

  if (selectError) {
    console.error("  ✗ Lecture impossible :", selectError.message);
    process.exit(1);
  }

  const rows = active ?? [];

  if (rows.length === 0) {
    console.log("  ✓ Aucun produit démo actif trouvé.\n");
    process.exit(0);
  }

  console.log(`  ${rows.length} produit(s) démo actif(s) :\n`);
  for (const row of rows) {
    console.log(`    • ${row.slug} — ${row.name}`);
  }

  if (!apply) {
    console.log(
      "\n  [dry-run] Relancez avec --apply pour passer ces produits en brouillon.\n",
    );
    process.exit(0);
  }

  const { data: updated, error: updateError } = await supabase
    .from("products")
    .update({ status: "draft" })
    .in("slug", DEV_SEED_PRODUCT_SLUGS)
    .eq("status", "active")
    .select("id, slug");

  if (updateError) {
    console.error("\n  ✗ Mise à jour impossible :", updateError.message);
    process.exit(1);
  }

  console.log(`\n  ✓ ${updated?.length ?? 0} produit(s) passé(s) en brouillon.\n`);
}

main();
