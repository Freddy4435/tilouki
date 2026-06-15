import { describe, expect, it } from "vitest";

import {
  DEV_SEED_CHECKOUT_BLOCKED_MESSAGE,
  findDevSeedSlugAmong,
  isDevSeedProductSlug,
} from "@/lib/catalog/dev-seed";
import { DEV_SEED_PRODUCT_SLUGS } from "@/lib/catalog/dev-seed.fixture";

describe("dev-seed — détection par slug", () => {
  it("reconnaît chaque slug du fixture", () => {
    for (const slug of DEV_SEED_PRODUCT_SLUGS) {
      expect(isDevSeedProductSlug(slug)).toBe(true);
    }
  });

  it("ignore les slugs catalogue réels", () => {
    expect(isDevSeedProductSlug("robe-ete-2026")).toBe(false);
    expect(isDevSeedProductSlug("")).toBe(false);
  });

  it("findDevSeedSlugAmong retourne le premier slug démo", () => {
    expect(findDevSeedSlugAmong(["robe-ete", DEV_SEED_PRODUCT_SLUGS[0]!])).toBe(
      DEV_SEED_PRODUCT_SLUGS[0],
    );
    expect(findDevSeedSlugAmong(["robe-ete", "pantalon-hiver"])).toBeNull();
  });

  it("expose un message checkout explicite", () => {
    expect(DEV_SEED_CHECKOUT_BLOCKED_MESSAGE).toMatch(/démonstration/i);
    expect(DEV_SEED_CHECKOUT_BLOCKED_MESSAGE).toMatch(/production/i);
  });
});
