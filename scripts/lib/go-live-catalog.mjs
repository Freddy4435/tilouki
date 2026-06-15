/**
 * Planification bascule catalogue — garder synchronisé avec les tests
 * src/lib/catalog/go-live-catalog.test.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEV_SEED_PRODUCT_SLUGS } from "./dev-seed-slugs.mjs";

const root = resolve(import.meta.dirname, "../..");

export function loadCatalogProductSlugs() {
  const data = JSON.parse(
    readFileSync(resolve(root, "data/catalog-products.json"), "utf8"),
  );
  return data.products.map((p) => p.slug);
}

export const CATALOG_PRODUCT_SLUGS = loadCatalogProductSlugs();

/** Slugs démo sans équivalent catalogue (désactivation directe après seed). */
export function getExclusiveDemoSlugs(
  devSlugs = DEV_SEED_PRODUCT_SLUGS,
  catalogSlugs = CATALOG_PRODUCT_SLUGS,
) {
  const catalogSet = new Set(catalogSlugs);
  return devSlugs.filter((slug) => !catalogSet.has(slug));
}

/**
 * @param {object} params
 * @param {Array<{ slug: string; name?: string; status?: string }>} params.demoProducts
 * @param {string[]} params.catalogSlugs
 * @param {string[]} params.orderSlugs slugs démo référencés par au moins une commande
 * @param {string[]} [params.devSlugs]
 */
export function planDemoDeactivation({
  demoProducts,
  catalogSlugs,
  orderSlugs,
  devSlugs = DEV_SEED_PRODUCT_SLUGS,
}) {
  const catalogSet = new Set(catalogSlugs);
  const orderSet = new Set(orderSlugs);
  const bySlug = new Map(demoProducts.map((p) => [p.slug, p]));

  /** @type {Array<{ slug: string; name: string; status: string }>} */
  const catalogReplacement = [];
  /** @type {Array<{ slug: string; name: string; status: string }>} */
  const toDeactivate = [];
  /** @type {Array<{ slug: string; name: string; status: string }>} */
  const skippedDueToOrders = [];
  /** @type {Array<{ slug: string; name: string; status: string }>} */
  const alreadyInactive = [];

  for (const slug of devSlugs) {
    const product = bySlug.get(slug);
    const name = product?.name ?? slug;
    const status = product?.status ?? "absent";

    if (catalogSet.has(slug)) {
      catalogReplacement.push({ slug, name, status });
      continue;
    }

    if (orderSet.has(slug)) {
      skippedDueToOrders.push({ slug, name, status });
      continue;
    }

    if (!product || product.status !== "active") {
      alreadyInactive.push({ slug, name, status });
      continue;
    }

    toDeactivate.push({ slug, name, status });
  }

  return {
    catalogReplacement,
    toDeactivate,
    skippedDueToOrders,
    alreadyInactive,
  };
}

export function slugsToDeactivate(plan) {
  return plan.toDeactivate.map((row) => row.slug);
}

/** Aucune suppression physique — uniquement brouillon. */
export const DEMO_DEACTIVATION_STATUS = "draft";
