import { describe, expect, it } from "vitest";

import {
  buildProductPhotoChecklist,
  classifyProductImage,
  getNonCommercialMainImageMessage,
  getPhotoReadinessSummary,
  isCommercialProductImage,
  pickStorefrontPrimaryImage,
} from "@/lib/admin/product-image-readiness";

const commercialUrl =
  "https://example.supabase.co/storage/v1/object/public/product-images/abc/robe.jpg";
const descriptiveAlt = "Robe fille face avant, coton imprimé";

describe("product-image-readiness", () => {
  it("classe les SVG /demo-products/ comme non vendables", () => {
    expect(classifyProductImage("/demo-products/body-bebe.svg")).toBe("demo-generated");
    expect(
      isCommercialProductImage("/demo-products/body-bebe.svg", descriptiveAlt),
    ).toBe(false);
  });

  it("classe les SVG catalogue démo comme non vendables", () => {
    expect(classifyProductImage("/products/robe-liberty-fleurie.svg")).toBe(
      "demo-generated",
    );
    expect(
      isCommercialProductImage("/products/robe-liberty-fleurie.svg", descriptiveAlt),
    ).toBe(false);
  });

  it("accepte une photo raster Supabase comme commerciale avec alt", () => {
    expect(classifyProductImage(commercialUrl, descriptiveAlt)).toBe("commercial");
    expect(isCommercialProductImage(commercialUrl, descriptiveAlt)).toBe(true);
    expect(isCommercialProductImage(commercialUrl)).toBe(false);
  });

  it("refuse une image marquée DEV", () => {
    expect(classifyProductImage(commercialUrl, "Vue [DEV] temporaire")).toBe(
      "dev-marked",
    );
    expect(getNonCommercialMainImageMessage("dev-marked")).toMatch(/\[DEV\]/i);
  });

  it("n'affiche pas les visuels démo sur le storefront", () => {
    const picked = pickStorefrontPrimaryImage([
      { url: "/products/pyjama-etoiles-coton.svg", sortOrder: 0 },
      { url: commercialUrl, sortOrder: 1, alt: descriptiveAlt },
    ]);
    expect(picked?.url).toBe(commercialUrl);
  });

  it("construit la checklist photos avec face avant obligatoire", () => {
    const incomplete = buildProductPhotoChecklist([
      { url: "/products/bonnet-maille-doux.svg", sortOrder: 0 },
    ]);
    expect(incomplete.find((item) => item.id === "face-avant")?.filled).toBe(false);

    const ready = buildProductPhotoChecklist([
      {
        url: commercialUrl,
        sortOrder: 0,
        alt: descriptiveAlt,
        width: 1200,
        height: 1500,
      },
      {
        url: `${commercialUrl}?v=2`,
        sortOrder: 1,
        alt: "Détail matière coton",
      },
    ]);
    expect(ready.find((item) => item.id === "face-avant")?.filled).toBe(true);
    expect(ready.find((item) => item.id === "alt-descriptif")?.filled).toBe(true);
    expect(ready.find((item) => item.id === "detail-matiere")?.filled).toBe(true);
    expect(ready.find((item) => item.id === "mise-en-scene")?.filled).toBe(false);
    expect(ready.find((item) => item.id === "couleur-fidele")?.filled).toBe(false);
    expect(ready.find((item) => item.id === "ratio-portrait")?.filled).toBe(true);
  });

  it("exige un défaut documenté pour la seconde main", () => {
    const secondHand = buildProductPhotoChecklist(
      [{ url: commercialUrl, sortOrder: 0, alt: descriptiveAlt }],
      { secondHand: true },
    );
    expect(secondHand.find((item) => item.id === "defaut-documente")?.filled).toBe(
      false,
    );
    expect(secondHand.find((item) => item.id === "defaut-documente")?.tier).toBe(
      "required",
    );
  });

  it("résume le nombre de photos prêtes à vendre", () => {
    const summary = getPhotoReadinessSummary([
      { url: commercialUrl, alt: descriptiveAlt },
    ]);
    expect(summary.commercialCount).toBe(1);
    expect(summary.readyToSell).toBe(false);
    expect(summary.targetCount).toBe(3);
  });
});
