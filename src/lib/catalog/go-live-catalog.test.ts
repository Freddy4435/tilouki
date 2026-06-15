import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { CATALOG_SEED_PRODUCT_SLUGS } from "@/lib/catalog/catalog-seed.fixture";
import { DEV_SEED_PRODUCT_SLUGS } from "@/lib/catalog/dev-seed.fixture";

import {
  getExclusiveDemoSlugs,
  planDemoDeactivation,
  slugsToDeactivate,
} from "../../../scripts/lib/go-live-catalog.mjs";

function mockDemo(slug: string, status: "active" | "draft" = "active", name?: string) {
  return { id: `id-${slug}`, slug, name: name ?? slug, status };
}

describe("go-live-catalog — slugs démo", () => {
  it("cible les 12 slugs démo de la fixture", () => {
    expect(DEV_SEED_PRODUCT_SLUGS).toHaveLength(12);
  });

  it("sépare les slugs démo exclusifs de ceux recouverts par le catalogue", () => {
    const exclusive = getExclusiveDemoSlugs(
      [...DEV_SEED_PRODUCT_SLUGS],
      [...CATALOG_SEED_PRODUCT_SLUGS],
    );
    expect(exclusive).toHaveLength(6);
    expect(exclusive).not.toContain("gigoteuse-nuages-bebe");
    expect(exclusive).toContain("body-bebe-coton-naturel");
    expect(exclusive).toContain("short-garcon-promo");
  });
});

describe("go-live-catalog — planDemoDeactivation", () => {
  it("prévoit 20 upserts catalogue et 12 traitements démo (6 recouverts + 6 brouillon)", () => {
    const demoProducts = DEV_SEED_PRODUCT_SLUGS.map((slug) => mockDemo(slug));
    const plan = planDemoDeactivation({
      demoProducts,
      catalogSlugs: [...CATALOG_SEED_PRODUCT_SLUGS],
      orderSlugs: [],
    });

    expect(CATALOG_SEED_PRODUCT_SLUGS).toHaveLength(20);
    expect(plan.catalogReplacement).toHaveLength(6);
    expect(plan.toDeactivate).toHaveLength(6);
    expect(plan.skippedDueToOrders).toHaveLength(0);
    expect(slugsToDeactivate(plan)).toEqual(
      expect.arrayContaining(["body-bebe-coton-naturel", "short-garcon-promo"]),
    );
  });

  it("refuse de désactiver un produit démo référencé par une commande", () => {
    const blockedSlug = "body-bebe-coton-naturel";
    const demoProducts = DEV_SEED_PRODUCT_SLUGS.map((slug) => mockDemo(slug));
    const plan = planDemoDeactivation({
      demoProducts,
      catalogSlugs: [...CATALOG_SEED_PRODUCT_SLUGS],
      orderSlugs: [blockedSlug],
    });

    expect(plan.skippedDueToOrders.map((r) => r.slug)).toContain(blockedSlug);
    expect(slugsToDeactivate(plan)).not.toContain(blockedSlug);
  });

  it("ne désactive pas les slugs déjà recouverts par le catalogue", () => {
    const overlapping = "robe-liberty-fleurie";
    const demoProducts = DEV_SEED_PRODUCT_SLUGS.map((slug) => mockDemo(slug));
    const plan = planDemoDeactivation({
      demoProducts,
      catalogSlugs: [...CATALOG_SEED_PRODUCT_SLUGS],
      orderSlugs: [],
    });

    expect(plan.catalogReplacement.map((r) => r.slug)).toContain(overlapping);
    expect(slugsToDeactivate(plan)).not.toContain(overlapping);
  });

  it("n'utilise pas de DELETE physique dans le seed catalogue", () => {
    const sql = readFileSync(
      resolve(import.meta.dirname, "../../../supabase/seed.catalog-products.sql"),
      "utf8",
    );
    expect(sql).not.toMatch(/DELETE FROM public\.products/i);
    expect(sql).toMatch(/ON CONFLICT \(slug\) DO UPDATE/i);
  });
});
