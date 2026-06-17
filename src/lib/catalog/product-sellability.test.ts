import { describe, expect, it } from "vitest";

import { DEV_SEED_PRODUCT_SLUGS } from "@/lib/catalog/dev-seed.fixture";
import {
  applyStorefrontListItemGuards,
  sortStorefrontListedFirst,
} from "@/lib/catalog/product-card-data";
import {
  classifyProductImage,
  countCommercialStorefrontImages,
  filterStorefrontListedProducts,
  getStorefrontListingBlockers,
  getStorefrontPhotoStatus,
  hasCommercialStorefrontImages,
  findLegacyDemoProductImageIssues,
  isLegacyDemoProductImageUrl,
  isCommercialProductImage,
  isDescriptiveCommercialAlt,
  isProductReadyToSell,
  isProductStorefrontListed,
  isProductStorefrontSellable,
  isStorefrontBlockedSlug,
  resolveSellabilityClientNotice,
  STOREFRONT_BLOCKED_TECHNICAL_SLUGS,
  STOREFRONT_COMMERCIAL_PHOTOS_MIN,
  STOREFRONT_READY_TO_SELL_PHOTOS_MIN,
} from "@/lib/catalog/product-sellability";
import type { ProductImage, ProductListItem } from "@/types/catalog";

const commercialUrl =
  "https://example.supabase.co/storage/v1/object/public/product-images/robe.jpg";
const descriptiveAlt = "Robe fille face avant, coton bleu";

function listItem(overrides: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: "p1",
    slug: "robe-ete",
    name: "Robe",
    shortDescription: null,
    minPriceCents: 1500,
    compareAtPriceCents: null,
    primaryImageUrl: commercialUrl,
    primaryImageAlt: descriptiveAlt,
    secondaryImageUrl: null,
    secondaryImageAlt: null,
    categorySlug: "fille",
    categoryName: "Fille",
    season: null,
    material: null,
    sizes: ["4 ans"],
    ageLabels: ["4 ans"],
    totalStock: 2,
    badges: [],
    createdAt: "2026-06-01T10:00:00.000Z",
    colorOptions: [],
    quickAddVariants: [
      {
        id: "v1",
        sizeLabel: "4 ans",
        ageLabel: "4 ans",
        color: null,
        priceCents: 1500,
        stockQuantity: 2,
        sku: "TK-1",
        weightGrams: 100,
      },
    ],
    ...overrides,
  };
}

function image(overrides: Partial<ProductImage> = {}): ProductImage {
  return {
    id: "img-1",
    url: "/products/test.svg",
    alt: null,
    sortOrder: 0,
    ...overrides,
  };
}

describe("isCommercialProductImage", () => {
  it("exige une URL raster et un alt descriptif", () => {
    expect(isCommercialProductImage(commercialUrl, descriptiveAlt)).toBe(true);
    expect(isCommercialProductImage(commercialUrl, "Robe")).toBe(false);
    expect(isCommercialProductImage(commercialUrl, "Photo à venir")).toBe(false);
    expect(isCommercialProductImage("/products/robe.svg", descriptiveAlt)).toBe(false);
  });

  it("refuse les photos stock et éditoriales comme produit", () => {
    expect(isCommercialProductImage("/editorial/hero-home.webp", descriptiveAlt)).toBe(
      false,
    );
    expect(
      isCommercialProductImage(
        "https://images.pexels.com/photos/123/pexels-photo-123.jpeg",
        descriptiveAlt,
      ),
    ).toBe(false);
    expect(
      isCommercialProductImage("https://images.unsplash.com/photo-123", descriptiveAlt),
    ).toBe(false);
    expect(
      isCommercialProductImage(
        "/images/tilouki/01-categories/categorie-bebe-combinaison-grise.jpg",
        descriptiveAlt,
      ),
    ).toBe(false);
  });
});

describe("isDescriptiveCommercialAlt", () => {
  it("refuse les alt trop courts ou placeholders", () => {
    expect(isDescriptiveCommercialAlt(descriptiveAlt)).toBe(true);
    expect(isDescriptiveCommercialAlt("Robe")).toBe(false);
    expect(isDescriptiveCommercialAlt("Photo à venir")).toBe(false);
    expect(isDescriptiveCommercialAlt("[DEV] test photo")).toBe(false);
  });
});

describe("countCommercialStorefrontImages", () => {
  it("compte uniquement les photos commerciales valides", () => {
    expect(
      countCommercialStorefrontImages([
        { url: commercialUrl, alt: descriptiveAlt },
        { url: "/products/demo.svg", alt: "Visuel démo" },
        { url: `${commercialUrl}?v=2`, alt: "Détail matière coton" },
      ]),
    ).toBe(2);
  });
});

describe("isProductReadyToSell", () => {
  it(`recommande au moins ${STOREFRONT_READY_TO_SELL_PHOTOS_MIN} photos`, () => {
    const one = [{ url: commercialUrl, alt: descriptiveAlt }];
    const three = [
      { url: commercialUrl, alt: descriptiveAlt },
      { url: `${commercialUrl}?v=2`, alt: "Détail matière coton" },
      { url: `${commercialUrl}?v=3`, alt: "Couleur bleu marine" },
    ];
    expect(isProductReadyToSell(one)).toBe(false);
    expect(isProductReadyToSell(three)).toBe(true);
  });
});

describe("isStorefrontBlockedSlug", () => {
  it("bloque les slugs démo seed et techniques", () => {
    expect(isStorefrontBlockedSlug(DEV_SEED_PRODUCT_SLUGS[0]!)).toBe(true);
    for (const slug of STOREFRONT_BLOCKED_TECHNICAL_SLUGS) {
      expect(isStorefrontBlockedSlug(slug)).toBe(true);
    }
    expect(isStorefrontBlockedSlug("robe-ete-2026")).toBe(false);
  });
});

describe("hasCommercialStorefrontImages", () => {
  it("accepte les JPEG bucket product-images avec alt", () => {
    expect(
      hasCommercialStorefrontImages([{ url: commercialUrl, alt: descriptiveAlt }]),
    ).toBe(true);
  });

  it("refuse sans alt descriptif", () => {
    expect(hasCommercialStorefrontImages([{ url: commercialUrl, alt: "Robe" }])).toBe(
      false,
    );
  });

  it("refuse les SVG démo", () => {
    expect(
      hasCommercialStorefrontImages([
        { url: "/demo-products/body.svg", alt: "Visuel démo généré" },
      ]),
    ).toBe(false);
  });

  it(`exige au moins ${STOREFRONT_COMMERCIAL_PHOTOS_MIN} photo`, () => {
    expect(hasCommercialStorefrontImages([])).toBe(false);
  });
});

describe("isProductStorefrontListed", () => {
  it("exige slug autorisé, photo commerciale et alt descriptif", () => {
    expect(isProductStorefrontListed(listItem())).toBe(true);
    expect(isProductStorefrontListed(listItem({ primaryImageUrl: null }))).toBe(false);
    expect(
      isProductStorefrontListed(listItem({ primaryImageAlt: "Photo à venir" })),
    ).toBe(false);
    expect(
      isProductStorefrontListed(
        listItem({ slug: "produit-test-csp", primaryImageUrl: commercialUrl }),
      ),
    ).toBe(false);
    expect(
      isProductStorefrontListed(
        listItem({
          primaryImageUrl: "/products/robe-liberty-fleurie.svg",
          primaryImageAlt: descriptiveAlt,
        }),
      ),
    ).toBe(false);
  });
});

describe("isProductStorefrontSellable", () => {
  it("returns false when no commercial images", () => {
    expect(isProductStorefrontSellable([])).toBe(false);
    expect(isProductStorefrontSellable([image()])).toBe(false);
  });

  it("returns true for commercial photo with alt", () => {
    expect(
      isProductStorefrontSellable([image({ url: commercialUrl, alt: descriptiveAlt })]),
    ).toBe(true);
  });
});

describe("classifyProductImage", () => {
  it("classe les patterns interdits", () => {
    expect(classifyProductImage("/products/robe.svg")).toBe("demo-generated");
    expect(classifyProductImage("/demo-products/body.svg")).toBe("demo-generated");
  });
});

describe("isLegacyDemoProductImageUrl", () => {
  it("détecte les chemins SVG catalogue et demo-products", () => {
    expect(isLegacyDemoProductImageUrl("/products/body-bebe-coton-bio.svg")).toBe(true);
    expect(isLegacyDemoProductImageUrl("/demo-products/pyjama-etoiles.svg")).toBe(true);
    expect(
      isLegacyDemoProductImageUrl(
        "https://example.supabase.co/storage/v1/object/public/product-images/a.jpg",
      ),
    ).toBe(false);
  });
});

describe("findLegacyDemoProductImageIssues", () => {
  it("signale chaque visuel démo encore attaché à la fiche", () => {
    const issues = findLegacyDemoProductImageIssues([
      { url: "/products/robe.svg", alt: "Robe" },
      { url: commercialUrl, alt: descriptiveAlt },
      { url: "/demo-products/body.svg", alt: "Body" },
    ]);
    expect(issues).toHaveLength(2);
    expect(issues.map((issue) => issue.source)).toEqual([
      "catalog-svg",
      "demo-products",
    ]);
  });
});

describe("filterStorefrontListedProducts", () => {
  it("retire démo et fiches sans photo commerciale", () => {
    const filtered = filterStorefrontListedProducts([
      listItem(),
      listItem({ slug: DEV_SEED_PRODUCT_SLUGS[0]! }),
      listItem({ primaryImageUrl: null }),
      listItem({ primaryImageAlt: "court" }),
    ]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe("robe-ete");
  });
});

describe("applyStorefrontListItemGuards", () => {
  it("vide quickAddVariants hors storefront listé", () => {
    const guarded = applyStorefrontListItemGuards(
      listItem({ slug: DEV_SEED_PRODUCT_SLUGS[0]!, primaryImageUrl: null }),
    );
    expect(guarded.quickAddVariants).toEqual([]);
  });
});

describe("getStorefrontListingBlockers", () => {
  it("explique l'absence boutique pour un SVG catalogue", () => {
    const blockers = getStorefrontListingBlockers(
      listItem({
        primaryImageUrl: "/products/robe-liberty-fleurie.svg",
        primaryImageAlt: descriptiveAlt,
      }),
    );
    expect(blockers).toHaveLength(1);
    expect(blockers[0]?.id).toBe("demo-generated-image");
    expect(blockers[0]?.message).toMatch(/SVG/i);
  });

  it("explique l'absence boutique pour le pack Tilouki", () => {
    const blockers = getStorefrontListingBlockers(
      listItem({
        primaryImageUrl:
          "/images/tilouki/01-categories/categorie-bebe-combinaison-grise.jpg",
        primaryImageAlt: descriptiveAlt,
      }),
    );
    expect(blockers[0]?.id).toBe("editorial-pack-image");
  });

  it("n'a pas de bloqueur quand la photo principale est commerciale", () => {
    expect(getStorefrontListingBlockers(listItem())).toEqual([]);
  });

  it("signale un alt manquant ou trop court", () => {
    const blockers = getStorefrontListingBlockers(
      listItem({ primaryImageAlt: "Robe" }),
    );
    expect(blockers[0]?.id).toBe("missing-descriptive-alt");
  });
});

describe("getStorefrontPhotoStatus", () => {
  it("passe à listed avec 1 photo et ready-to-sell avec 3", () => {
    const one = [{ url: commercialUrl, alt: descriptiveAlt }];
    const three = [
      { url: commercialUrl, alt: descriptiveAlt },
      { url: `${commercialUrl}?v=2`, alt: "Détail matière coton" },
      { url: `${commercialUrl}?v=3`, alt: "Pyjama plié sur cintre" },
    ];
    expect(getStorefrontPhotoStatus([]).status).toBe("hidden");
    expect(getStorefrontPhotoStatus(one).status).toBe("listed");
    expect(getStorefrontPhotoStatus(three).status).toBe("ready-to-sell");
  });
});

describe("catalog-products fixture", () => {
  it("signale les SVG seed du catalogue import comme visuels démo", async () => {
    const catalog = (await import("../../../data/catalog-products.json")).default as {
      products: Array<{ imageSlug: string }>;
    };

    for (const product of catalog.products) {
      expect(isLegacyDemoProductImageUrl(`/products/${product.imageSlug}.svg`)).toBe(
        true,
      );
    }
  });
});

describe("sortStorefrontListedFirst", () => {
  it("place les fiches listées avant les autres", () => {
    const sorted = sortStorefrontListedFirst([
      listItem({
        slug: "produit-test-csp",
        primaryImageUrl: null,
        createdAt: "2026-06-10T00:00:00.000Z",
      }),
      listItem({ createdAt: "2026-06-01T00:00:00.000Z" }),
    ]);
    expect(sorted[0]?.slug).toBe("robe-ete");
  });
});

describe("resolveSellabilityClientNotice", () => {
  it("explique clairement le blocage photo pour le client et l'admin", () => {
    const notice = resolveSellabilityClientNotice("robe-test", []);
    expect(notice.title).toMatch(/bientôt|préparation/i);
    expect(notice.body.length).toBeGreaterThan(24);
    expect(notice.adminHint).toMatch(/photo/i);
  });
});
