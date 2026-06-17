#!/usr/bin/env node
/**
 * Audit Lot A — état go-live (DB Supabase + garde-fou env + sonde HTTP).
 * Usage : npm run go-live:audit
 */
import { createClient } from "@supabase/supabase-js";

import { DEV_SEED_PRODUCT_SLUGS } from "./lib/dev-seed-slugs.mjs";
import { loadProjectEnv } from "./lib/load-env-files.mjs";
import { CATALOG_PRODUCT_SLUGS } from "./lib/go-live-catalog.mjs";
import {
  runProductionEnvChecks,
  summarizeDeployChecks,
} from "./lib/verify-deploy-checks.mjs";

const BLOCKED_TEST_SLUGS = ["produit-test-csp"];
const SITE_URL = (process.env.GO_LIVE_AUDIT_URL ?? "https://tilouki.vercel.app").replace(
  /\/$/,
  "",
);

function statusIcon(ok) {
  return ok ? "✓" : "✗";
}

async function probeSite() {
  try {
    const health = await fetch(`${SITE_URL}/api/health`, {
      signal: AbortSignal.timeout(12_000),
    });
    const home = await fetch(`${SITE_URL}/`, { signal: AbortSignal.timeout(15_000) });
    return {
      healthOk: health.ok,
      homeOk: home.ok,
      healthStatus: health.status,
      homeStatus: home.status,
    };
  } catch (error) {
    return {
      healthOk: false,
      homeOk: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  loadProjectEnv({ production: true });

  console.log("\nTilouki — audit go-live (Lot A)\n");
  console.log(`  Site : ${SITE_URL}\n`);

  const deployChecks = runProductionEnvChecks(process.env, { production: true });
  const deploySummary = summarizeDeployChecks(deployChecks);
  const deployOk = deploySummary.errorCount === 0;

  console.log("── A.1 Garde-fou verify:deploy:prod ──\n");
  if (deployOk) {
    console.log("  ✓ Variables production OK (local / .env.production.local)\n");
  } else {
    console.log(
      `  ✗ ${deploySummary.errorCount} point(s) bloquant(s) — npm run verify:deploy:prod\n`,
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    console.log("  ⚠ Supabase non configuré localement — audit DB ignoré.\n");
    console.log(
      "  Copiez .env.production.local.example → .env.production.local pour un audit complet.\n",
    );
    process.exit(deployOk ? 0 : 1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [
    { data: products },
    { data: settings },
    { data: legalPages },
    { count: categoryCount },
    { count: catalogActiveCount },
    probe,
  ] = await Promise.all([
    supabase.from("products").select("slug, status, name").eq("status", "active"),
    supabase.from("shop_settings").select("*").limit(1).maybeSingle(),
    supabase.from("legal_pages").select("slug, title, content"),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .in("slug", CATALOG_PRODUCT_SLUGS),
    probeSite(),
  ]);

  const active = products ?? [];
  const catalogSlugSet = new Set(CATALOG_PRODUCT_SLUGS);
  const devActive = active.filter(
    (p) => DEV_SEED_PRODUCT_SLUGS.includes(p.slug) && !catalogSlugSet.has(p.slug),
  );
  const testActive = active.filter((p) => BLOCKED_TEST_SLUGS.includes(p.slug));
  const realActive = active.filter(
    (p) =>
      !DEV_SEED_PRODUCT_SLUGS.includes(p.slug) && !BLOCKED_TEST_SLUGS.includes(p.slug),
  );

  const legalFields = [
    ["legal_name", settings?.legal_name],
    ["siret", settings?.siret],
    ["email", settings?.email],
    ["phone", settings?.phone],
    ["address", settings?.address],
    ["mediation_name", settings?.mediation_name],
    ["mediation_url", settings?.mediation_url],
    ["host_name", settings?.host_name],
    ["return_policy", settings?.return_policy],
  ];
  const missingLegal = legalFields.filter(([, v]) => !String(v ?? "").trim()).map(([k]) => k);
  const legalOk = missingLegal.length === 0;

  const placeholderRe = /\[À COMPLÉTER\]|placeholder|lorem ipsum/i;
  const blockedLegal = (legalPages ?? []).filter((p) => placeholderRe.test(p.content ?? ""));
  const legalPagesOk = blockedLegal.length === 0 && (legalPages?.length ?? 0) >= 4;

  const catalogOk = (catalogActiveCount ?? 0) >= 10;
  const productsOk = realActive.length >= 10 && devActive.length === 0 && testActive.length === 0;

  console.log("── Sonde production ──\n");
  console.log(
    `  ${statusIcon(probe.healthOk)} /api/health → ${probe.healthStatus ?? probe.error ?? "?"}`,
  );
  console.log(
    `  ${statusIcon(probe.homeOk)} / → ${probe.homeStatus ?? probe.error ?? "?"}\n`,
  );

  console.log("── A.2 Identité légale (shop_settings) ──\n");
  if (legalOk) {
    console.log("  ✓ Champs obligatoires renseignés\n");
  } else {
    console.log(`  ✗ Manquant : ${missingLegal.join(", ")}\n`);
  }

  console.log("── A.2 Pages légales ──\n");
  if (legalPagesOk) {
    console.log(`  ✓ ${legalPages?.length ?? 0} page(s), sans placeholder\n`);
  } else {
    if (blockedLegal.length > 0) {
      console.log(`  ✗ Placeholder sur : ${blockedLegal.map((p) => p.slug).join(", ")}\n`);
    } else {
      console.log("  ✗ Pages légales incomplètes\n");
    }
  }

  console.log("── A.3 Catalogue ──\n");
  console.log(`  Catégories actives        : ${categoryCount ?? 0}`);
  console.log(`  Produits catalogue (TK)   : ${catalogActiveCount ?? 0} / ${CATALOG_PRODUCT_SLUGS.length}`);
  console.log(`  Produits réels actifs     : ${realActive.length}`);
  console.log(`  Produits démo actifs      : ${devActive.length}`);
  if (devActive.length > 0) {
    console.log(`    → ${devActive.map((p) => p.slug).join(", ")}`);
  }
  console.log(`  Produits test bloquants   : ${testActive.length}`);
  if (testActive.length > 0) {
    console.log(`    → ${testActive.map((p) => p.slug).join(", ")}`);
  }
  console.log(
    productsOk && catalogOk
      ? "\n  ✓ Catalogue prêt pour la vente\n"
      : "\n  ✗ Lancez : npm run catalog:go-live -- --apply\n",
  );

  console.log("── A.4 Supabase Auth (manuel) ──\n");
  console.log(`  → Redirect : ${SITE_URL}/auth/callback (magic link /compte)\n`);

  console.log("── A.5 Plausible (manuel) ──\n");
  console.log(
    "  → Goals : add_to_cart, begin_checkout, add_capsule_to_cart (voir docs/plausible-goals.md)\n",
  );

  console.log("── A.6 Commande test Live ──\n");
  console.log("  → docs/GO_LIVE_RECETTE.md (parcours B, montant ≤ 5 €)\n");

  const allDataOk = legalOk && legalPagesOk && productsOk && catalogOk;
  const siteOk = probe.healthOk && probe.homeOk;

  if (deployOk && allDataOk && siteOk) {
    console.log("✓ Audit Lot A : prêt pour commande test Live.\n");
    process.exit(0);
  }

  console.log("⚠ Audit Lot A : actions restantes avant encaissement.\n");
  process.exit(1);
}

main();
