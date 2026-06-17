import { describe, expect, it } from "vitest";

import {
  buildCatalogueViewSearchParams,
  buildPathWithSearchParams,
  parseCatalogueView,
} from "@/lib/catalog/catalogue-view";

describe("catalogue-view", () => {
  it("parse la vue depuis l'URL", () => {
    expect(parseCatalogueView({})).toBe("produits");
    expect(parseCatalogueView({ vue: "capsules" })).toBe("capsules");
    expect(parseCatalogueView({ vue: "rayons" })).toBe("rayons");
    expect(parseCatalogueView({ vue: "inconnu" })).toBe("produits");
  });

  it("bascule la vue en conservant les filtres", () => {
    const params = new URLSearchParams("genre=fille&tri=price_asc");
    const next = buildCatalogueViewSearchParams(params, "capsules");
    expect(next.get("vue")).toBe("capsules");
    expect(next.get("genre")).toBe("fille");
    expect(next.get("tri")).toBe("price_asc");
    expect(next.get("page")).toBeNull();
  });

  it("retire le paramètre vue par défaut", () => {
    const params = new URLSearchParams("vue=capsules&promo=petit-prix");
    const next = buildCatalogueViewSearchParams(params, "produits");
    expect(next.get("vue")).toBeNull();
    expect(next.get("promo")).toBe("petit-prix");
    expect(buildPathWithSearchParams("/catalogue", next)).toBe(
      "/catalogue?promo=petit-prix",
    );
  });
});
