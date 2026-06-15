import { describe, expect, it } from "vitest";

import { resolveBlogArticleCta } from "@/lib/blog/category-catalog";

describe("resolveBlogArticleCta", () => {
  it("garde le guide tailles pour les articles tailles", () => {
    expect(resolveBlogArticleCta("tailles", true)).toBe("guide-tailles");
    expect(resolveBlogArticleCta("tailles", false)).toBe("guide-tailles");
  });

  it("bascule sur le guide si le catalogue est vide", () => {
    expect(resolveBlogArticleCta("matieres", false)).toBe("guide-tailles");
    expect(resolveBlogArticleCta("budget", false)).toBe("guide-tailles");
  });

  it("propose le catalogue quand des produits sont disponibles", () => {
    expect(resolveBlogArticleCta("matieres", true)).toBe("catalogue");
    expect(resolveBlogArticleCta("budget", true)).toBe("catalogue");
  });
});
