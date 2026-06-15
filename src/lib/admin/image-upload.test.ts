import { describe, expect, it } from "vitest";

import {
  HERO_IMAGE_PROFILE,
  IMAGE_UPLOAD_LIMITS,
  PRODUCT_IMAGE_PROFILE,
  validateImageDimensions,
  validateImageFileBasics,
} from "@/lib/admin/image-upload";

describe("validateImageFileBasics", () => {
  it("accepte un JPEG dans la limite de poids", () => {
    expect(
      validateImageFileBasics({
        name: "robe.jpg",
        type: "image/jpeg",
        size: 2_000_000,
      }),
    ).toBeNull();
  });

  it("refuse un format non supporté", () => {
    expect(
      validateImageFileBasics({
        name: "doc.pdf",
        type: "application/pdf",
        size: 1000,
      }),
    ).toContain("format non supporté");
  });

  it("refuse un fichier trop lourd", () => {
    expect(
      validateImageFileBasics({
        name: "lourd.png",
        type: "image/png",
        size: IMAGE_UPLOAD_LIMITS.maxBytes + 1,
      }),
    ).toContain("trop lourd");
  });

  it("refuse un fichier vide", () => {
    expect(
      validateImageFileBasics({
        name: "vide.webp",
        type: "image/webp",
        size: 0,
      }),
    ).toContain("vide");
  });
});

describe("validateImageDimensions — produit", () => {
  it("accepte un portrait 4:5 suffisant", () => {
    expect(validateImageDimensions(800, 1000, PRODUCT_IMAGE_PROFILE)).toEqual({});
  });

  it("refuse une image trop petite", () => {
    const result = validateImageDimensions(400, 400, PRODUCT_IMAGE_PROFILE);
    expect(result.error).toContain("trop petite");
  });

  it("avertit si le ratio n'est pas portrait 4:5", () => {
    const result = validateImageDimensions(900, 1000, PRODUCT_IMAGE_PROFILE);
    expect(result.warning).toContain("portrait");
    expect(result.error).toBeUndefined();
  });
});

describe("validateImageDimensions — hero", () => {
  it("accepte un portrait 4:5", () => {
    expect(validateImageDimensions(800, 1000, HERO_IMAGE_PROFILE)).toEqual({});
  });

  it("avertit pour un format paysage", () => {
    const result = validateImageDimensions(1200, 1000, HERO_IMAGE_PROFILE);
    expect(result.warning).toContain("portrait");
    expect(result.error).toBeUndefined();
  });
});
